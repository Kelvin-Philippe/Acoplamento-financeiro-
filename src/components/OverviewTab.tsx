import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Transaction, SavingsGoal, Category } from '../types/finance';
import { formatBRL, formatPercent } from '../utils/currency';
import { calculate503020Rule } from '../utils/autoGoalsEngine';

interface OverviewTabProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  onOpenDeposit: (goal: SavingsGoal) => void;
  onNavigateTab: (tab: 'overview' | 'transactions' | 'goals' | 'python') => void;
  onNewTransaction: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  transactions,
  savingsGoals,
  categories,
  onOpenDeposit,
  onNavigateTab,
  onNewTransaction,
}) => {
  // Aggregate monthly numbers
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;

  const essentialExpenses = expenseTransactions
    .filter((t) => t.nature === 'essential')
    .reduce((sum, t) => sum + t.amount, 0);

  const lifestyleExpenses = expenseTransactions
    .filter((t) => t.nature === 'lifestyle')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsExpenses = expenseTransactions
    .filter((t) => t.nature === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaved = savingsExpenses + Math.max(0, netCashFlow);
  const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

  // 50/30/20 calculation
  const rule503020 = calculate503020Rule(totalIncome, transactions);

  // Category breakdown
  const categoryTotals: { [key: string]: number } = {};
  expenseTransactions.forEach((t) => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Outros',
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: cat?.color || 'slate',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* 4-KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Receita Mensal</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatBRL(totalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Salário, freelas e rendimentos
          </div>
        </div>

        {/* Despesas Totais */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Despesas Totais</span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {formatBRL(totalExpenses)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {transactions.filter((t) => t.type === 'expense').length} pagamentos realizados
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Saldo Líquido</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              netCashFlow >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatBRL(netCashFlow)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {netCashFlow >= 0 ? 'Superávit disponível' : 'Déficit no período'}
          </div>
        </div>

        {/* Taxa de Poupança */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Taxa de Poupança</span>
            <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-lg">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-600 dark:text-cyan-400">
            {formatPercent(savingsRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {savingsRate >= 20 ? 'Meta saudável atingida (≥ 20%)' : 'Abaixo do recomendado de 20%'}
          </div>
        </div>
      </div>

      {/* Python Engine Callout Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Motor Financeiro em Python Ativo
            </h3>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-400/90 mt-0.5">
              Suas metas de economia (Reserva de Emergência e Regra 50/30/20) são calculadas
              automaticamente com algoritmos Python 3.12 prontos para exportação.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('python')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-950 dark:text-white bg-emerald-200/80 hover:bg-emerald-300 dark:bg-emerald-900/80 dark:hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <span>Abrir Terminal Python</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: 50/30/20 Diagnostic & Automated Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 50/30/20 Diagnostic */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Diagnóstico Automático Regra 50/30/20
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proporção recomendada para estabilidade e independência financeira
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  rule503020.healthScore === 'healthy'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : rule503020.healthScore === 'moderate'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {rule503020.healthScore === 'healthy'
                  ? 'Orçamento Saudável'
                  : rule503020.healthScore === 'moderate'
                  ? 'Ajustes Sugeridos'
                  : 'Atenção Necessária'}
              </span>
            </div>

            {/* Bars */}
            <div className="space-y-4">
              {/* 50% Necessidades */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Necessidades Básicas (Teto: 50%)
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {formatBRL(rule503020.needsActual)} / Ideal: {formatBRL(rule503020.needsIdeal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        totalIncome > 0 ? (rule503020.needsActual / totalIncome) * 100 : 0
                      )}%`,
                    }}
                    className={`h-full rounded-full ${
                      rule503020.needsActual <= rule503020.needsIdeal
                        ? 'bg-blue-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Moradia, alimentação, utilidades, saúde</span>
                  <span className="font-mono tabular-nums">
                    {totalIncome > 0
                      ? `${((rule503020.needsActual / totalIncome) * 100).toFixed(1)}% da renda`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* 30% Desejos */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Estilo de Vida & Desejos (Teto: 30%)
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {formatBRL(rule503020.wantsActual)} / Ideal: {formatBRL(rule503020.wantsIdeal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        totalIncome > 0 ? (rule503020.wantsActual / totalIncome) * 100 : 0
                      )}%`,
                    }}
                    className={`h-full rounded-full ${
                      rule503020.wantsActual <= rule503020.wantsIdeal
                        ? 'bg-fuchsia-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Lazer, restaurantes, compras, assinaturas</span>
                  <span className="font-mono tabular-nums">
                    {totalIncome > 0
                      ? `${((rule503020.wantsActual / totalIncome) * 100).toFixed(1)}% da renda`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* 20% Poupança */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Poupança & Investimentos (Meta Mínima: 20%)
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {formatBRL(rule503020.savingsActual)} / Ideal:{' '}
                    {formatBRL(rule503020.savingsIdeal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        totalIncome > 0 ? (rule503020.savingsActual / totalIncome) * 100 : 0
                      )}%`,
                    }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Reserva, previdência, ações, títulos</span>
                  <span className="font-mono tabular-nums">
                    {totalIncome > 0
                      ? `${((rule503020.savingsActual / totalIncome) * 100).toFixed(1)}% poupado`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Parecer do Algoritmo:
              </span>
              {rule503020.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metas Automáticas em Andamento */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Metas de Economia Ativas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculadas e sincronizadas automaticamente com seus gastos
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Gerenciar Metas
              </button>
            </div>

            <div className="space-y-4">
              {savingsGoals.map((goal) => {
                const percent = Math.min(
                  100,
                  goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
                );
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300">
                        {percent.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color,
                        }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums">
                        {formatBRL(goal.currentAmount)} de {formatBRL(goal.targetAmount)}
                      </span>
                      <button
                        onClick={() => onOpenDeposit(goal)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        + Aportar Valor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Reserva calculada sobre R$ {formatBRL(essentialExpenses)}/mês essenciais</span>
            <button
              onClick={() => onNavigateTab('goals')}
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ver Projeções & Horizontes →
            </button>
          </div>
        </div>
      </div>

      {/* Top Expense Categories Breakdown */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Distribuição de Gastos por Categoria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifique rapidamente onde está concentrado o seu consumo
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Ver Todas as Transações
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCategories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                  {formatBRL(cat.amount)}{' '}
                  <span className="text-slate-400 font-normal">({cat.percentage.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${cat.percentage}%` }}
                  className="h-full rounded-full bg-slate-900 dark:bg-emerald-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
