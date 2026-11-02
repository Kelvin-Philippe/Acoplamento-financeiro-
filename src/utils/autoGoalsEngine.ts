import { Transaction, SavingsGoal, MonthlyBudgetRule503020 } from '../types/finance';

/**
 * Calculates budget distribution according to the 50/30/20 rule
 */
export function calculate503020Rule(
  totalIncome: number,
  transactions: Transaction[]
): MonthlyBudgetRule503020 {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  // Sum by nature
  const needsActual = expenseTransactions
    .filter((t) => t.nature === 'essential')
    .reduce((sum, t) => sum + t.amount, 0);

  const wantsActual = expenseTransactions
    .filter((t) => t.nature === 'lifestyle')
    .reduce((sum, t) => sum + t.amount, 0);

  const explicitSavings = expenseTransactions
    .filter((t) => t.nature === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  // Remaining positive cash flow also counts towards available monthly savings
  const totalExpenses = needsActual + wantsActual + explicitSavings;
  const netCashFlow = Math.max(0, totalIncome - totalExpenses);
  const savingsActual = explicitSavings + netCashFlow;

  const needsIdeal = totalIncome * 0.5;
  const wantsIdeal = totalIncome * 0.3;
  const savingsIdeal = totalIncome * 0.2;

  const needsDiff = needsActual - needsIdeal;
  const wantsDiff = wantsActual - wantsIdeal;
  const savingsDiff = savingsActual - savingsIdeal;

  const recommendations: string[] = [];

  let healthScore: 'healthy' | 'moderate' | 'critical' = 'healthy';

  if (totalIncome === 0) {
    return {
      income: 0,
      needsIdeal: 0,
      needsActual: 0,
      needsDiff: 0,
      wantsIdeal: 0,
      wantsActual: 0,
      wantsDiff: 0,
      savingsIdeal: 0,
      savingsActual: 0,
      savingsDiff: 0,
      healthScore: 'moderate',
      recommendations: ['Cadastre suas receitas para calcular a regra 50/30/20 automaticamente.'],
    };
  }

  const needsPercent = (needsActual / totalIncome) * 100;
  const wantsPercent = (wantsActual / totalIncome) * 100;
  const savingsPercent = (savingsActual / totalIncome) * 100;

  if (needsPercent > 65) {
    healthScore = 'critical';
    recommendations.push(
      `Gastos Essenciais estão em ${needsPercent.toFixed(1)}% (teto recomendado: 50%). Tente renegociar aluguel, planos de telefonia e otimizar contas básicas.`
    );
  } else if (needsPercent > 50) {
    healthScore = 'moderate';
    recommendations.push(
      `Gastos Essenciais consom ${needsPercent.toFixed(1)}% da renda. Pequenos ajustes em compras e utilidades ajudarão a chegar aos 50%.`
    );
  } else {
    recommendations.push(
      `Excelente: seus gastos essenciais estão em ${needsPercent.toFixed(1)}%, confortavelmente abaixo dos 50%.`
    );
  }

  if (wantsPercent > 35) {
    if (healthScore !== 'critical') healthScore = 'moderate';
    recommendations.push(
      `Gastos com Estilo de Vida (Desejos) representam ${wantsPercent.toFixed(1)}% (ideal: até 30%). Avalie assinaturas e lazer para liberar margem de investimento.`
    );
  } else {
    recommendations.push(
      `Seu consumo de estilo de vida está calibrado (${wantsPercent.toFixed(1)}% vs meta de 30%).`
    );
  }

  if (savingsPercent >= 20) {
    recommendations.push(
      `Meta de Poupança atingida! Você está guardando ${savingsPercent.toFixed(1)}% da sua renda mensal.`
    );
  } else {
    recommendations.push(
      `Você está poupando ${savingsPercent.toFixed(1)}%. Para atingir a meta recomendada de 20%, o aporte mensal ideal deve ser de R$ ${savingsIdeal.toFixed(2)}.`
    );
  }

  return {
    income: totalIncome,
    needsIdeal,
    needsActual,
    needsDiff,
    wantsIdeal,
    wantsActual,
    wantsDiff,
    savingsIdeal,
    savingsActual,
    savingsDiff,
    healthScore,
    recommendations,
  };
}

/**
 * Calculates the automated emergency fund goal based on monthly essential expenses
 */
export function calculateEmergencyFundGoal(
  essentialMonthlyExpenses: number,
  monthsMultiplier: number = 6,
  existingFundAmount: number = 0,
  targetHorizonMonths: number = 12
): {
  targetAmount: number;
  monthlySuggestedContribution: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  targetMonthsHorizon: number;
} {
  // If essential expenses are zero or very low, fallback to minimum safe base
  const safeEssentials = essentialMonthlyExpenses > 0 ? essentialMonthlyExpenses : 3000;
  const targetAmount = Math.round(safeEssentials * monthsMultiplier);
  const remainingAmount = Math.max(0, targetAmount - existingFundAmount);
  const monthlySuggestedContribution = Math.round(remainingAmount / Math.max(1, targetHorizonMonths));
  const progressPercent = targetAmount > 0 ? Math.min(100, (existingFundAmount / targetAmount) * 100) : 0;

  return {
    targetAmount,
    monthlySuggestedContribution,
    currentAmount: existingFundAmount,
    remainingAmount,
    progressPercent,
    targetMonthsHorizon: targetHorizonMonths,
  };
}

/**
 * Auto-generates or re-synchronizes the smart goals
 */
export function generateSmartAutoGoals(
  totalIncome: number,
  transactions: Transaction[],
  existingGoals: SavingsGoal[],
  emergencyFundMonths: number = 6
): SavingsGoal[] {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const essentialExpenses = expenseTransactions
    .filter((t) => t.nature === 'essential')
    .reduce((sum, t) => sum + t.amount, 0);

  const existingEmergency = existingGoals.find((g) => g.autoRuleType === 'emergency_fund');
  const existing503020 = existingGoals.find((g) => g.autoRuleType === 'rule_50_30_20');

  // 1. Emergency Fund
  const emergencyTarget = Math.round((essentialExpenses || 3500) * emergencyFundMonths);
  const currentEmergencyAmount = existingEmergency ? existingEmergency.currentAmount : 0;
  const monthsToTarget = 12;
  const emergencyMonthly = Math.round(Math.max(200, (emergencyTarget - currentEmergencyAmount) / monthsToTarget));

  const updatedEmergencyGoal: SavingsGoal = {
    id: existingEmergency ? existingEmergency.id : 'goal_reserva_emergencia',
    title: `Reserva de Emergência (${emergencyFundMonths} Meses)`,
    category: 'Segurança Financeira',
    targetAmount: emergencyTarget,
    currentAmount: currentEmergencyAmount,
    deadline: existingEmergency?.deadline || '2027-11-30',
    monthlyTargetContribution: emergencyMonthly,
    autoRuleType: 'emergency_fund',
    isAutoGenerated: true,
    color: '#10b981',
    icon: 'ShieldCheck',
    notes: `Calculado automaticamente em Python: ${emergencyFundMonths}x seus gastos essenciais mensais (R$ ${essentialExpenses.toFixed(2)}/mês).`,
    estimatedMonthsRemaining: Math.ceil((emergencyTarget - currentEmergencyAmount) / (emergencyMonthly || 1)),
  };

  // 2. 50/30/20 Rule Goal (20% of Income)
  const idealMonthlySavings = totalIncome * 0.2;
  const annualTarget = Math.round(idealMonthlySavings * 12);
  const current503020Amount = existing503020 ? existing503020.currentAmount : 0;

  const updated503020Goal: SavingsGoal = {
    id: existing503020 ? existing503020.id : 'goal_meta_50_30_20',
    title: 'Meta Automática 50/30/20 (20% Investimentos)',
    category: 'Construção Patrimonial',
    targetAmount: annualTarget > 0 ? annualTarget : 24000,
    currentAmount: current503020Amount,
    deadline: existing503020?.deadline || '2027-12-31',
    monthlyTargetContribution: Math.round(idealMonthlySavings),
    autoRuleType: 'rule_50_30_20',
    isAutoGenerated: true,
    color: '#06b6d4',
    icon: 'TrendingUp',
    notes: `Calculado automaticamente: 20% da sua receita mensal (R$ ${idealMonthlySavings.toFixed(2)}/mês) para independência financeira.`,
    estimatedMonthsRemaining: Math.ceil((annualTarget - current503020Amount) / (idealMonthlySavings || 1)),
  };

  // Keep any custom goals created by the user
  const customGoals = existingGoals.filter(
    (g) => g.autoRuleType !== 'emergency_fund' && g.autoRuleType !== 'rule_50_30_20'
  );

  return [updatedEmergencyGoal, updated503020Goal, ...customGoals];
}
