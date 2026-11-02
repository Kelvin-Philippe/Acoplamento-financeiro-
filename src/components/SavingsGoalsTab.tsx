import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  PiggyBank,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { SavingsGoal, Transaction } from '../types/finance';
import { formatBRL, formatPercent } from '../utils/currency';

interface SavingsGoalsTabProps {
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
  monthlyIncome: number;
  essentialMonthlyExpenses: number;
  onOpenDeposit: (goal: SavingsGoal) => void;
  onNewGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onAutoGenerateGoals: (months: number) => void;
  onNavigateTab: (tab: 'overview' | 'transactions' | 'goals' | 'python') => void;
}

export const SavingsGoalsTab: React.FC<SavingsGoalsTabProps> = ({
  savingsGoals,
  transactions,
  monthlyIncome,
  essentialMonthlyExpenses,
  onOpenDeposit,
  onNewGoal,
  onEditGoal,
  onDeleteGoal,
  onAutoGenerateGoals,
  onNavigateTab,
}) => {
  const [emergencyMonths, setEmergencyMonths] = useState<number>(6);
  const [extraDepositSimulation, setExtraDepositSimulation] = useState<number>(200);

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthlyPlan = savingsGoals.reduce((sum, g) => sum + g.monthlyTargetContribution, 0);
  const globalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Metas de Economia & Otimização
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Defina metas baseadas no seu padrão de gastos real com cálculos automatizados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAutoGenerateGoals(emergencyMonths)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recalcular Metas Automaticamente</span>
          </button>
          <button
            onClick={onNewGoal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Total Já Acumulado
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBRL(totalCurrent)}
          </div>
          <span className="text-[11px] text-slate-400">
            De {formatBRL(totalTarget)} planejados ({formatPercent(globalProgress)})
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Plano de Aporte Mensal Total
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatBRL(totalMonthlyPlan)}/mês
          </div>
          <span className="text-[11px] text-slate-400">
            Soma dos aportes planejados para todas as metas
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Custo Essencial Mensal (Base da Reserva)
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {formatBRL(essentialMonthlyExpenses)}/mês
          </div>
          <span className="text-[11px] text-slate-400">
            Moradia, supermercado, utilidades e saúde
          </span>
        </div>
      </div>

      {/* Auto-Goals Python Engine Card */}
      <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Motor Algorítmico em Python
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">Regra 50/30/20 & Reserva Dinâmica</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Como o PyFinanças calcula suas metas automaticamente:
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O motor analisa seus custos essenciais (R$ {formatBRL(essentialMonthlyExpenses)}/mês)
              e projeta o fundo de segurança ideal. Também aplica a Regra 50/30/20 da Senadora
              Elizabeth Warren, reservando 20% da sua receita líquida (R$ {formatBRL(monthlyIncome * 0.2)}/mês)
              para investimentos com juros compostos.
            </p>
          </div>

          {/* Interactive Multiplier Selection */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3 shrink-0">
            <span className="text-xs font-semibold text-slate-300 block">
              Tamanho da Reserva de Emergência:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setEmergencyMonths(m);
                    onAutoGenerateGoals(m);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    emergencyMonths === m
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m} meses
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
              <span>Alvo calculado ({emergencyMonths}x):</span>
              <span className="font-mono tabular-nums text-emerald-400 font-bold">
                {formatBRL((essentialMonthlyExpenses || 3500) * emergencyMonths)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(
            100,
            goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {goal.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      title="Editar Meta"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      title="Excluir Meta"
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Numbers */}
                <div className="my-3">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Progresso Atual:</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {percent.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                      {formatBRL(goal.currentAmount)}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      de {formatBRL(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg text-xs space-y-1.5 my-3 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Aporte Recomendado:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatBRL(goal.monthlyTargetContribution)}/mês
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Falta Poupado:</span>
                    <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatBRL(remaining)}
                    </span>
                  </div>
                  {goal.estimatedMonthsRemaining !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Prazo Estimado:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ~{goal.estimatedMonthsRemaining} meses restantes
                      </span>
                    </div>
                  )}
                </div>

                {goal.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-3">
                    {goal.notes}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onOpenDeposit(goal)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <PiggyBank className="w-4 h-4" />
                  <span>Aportar Valor nesta Meta</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator: Compound Interest & Acceleration */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Simulador de Aceleração com Juros Compostos (CDI 11,75% a.a.)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Veja o impacto de adicionar um aporte extra no tempo de conclusão das suas metas
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Aporte Extra:</span>
            {[100, 250, 500, 1000].map((v) => (
              <button
                key={v}
                onClick={() => setExtraDepositSimulation(v)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  extraDepositSimulation === v
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                +R$ {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Em 1 Ano (12 meses)
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatBRL(
                ((totalMonthlyPlan + extraDepositSimulation) * 12) * 1.06
              )}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              +{formatBRL(extraDepositSimulation * 12)} com seu esforço extra
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Em 3 Anos (36 meses)
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatBRL(
                ((totalMonthlyPlan + extraDepositSimulation) * 36) * 1.19
              )}
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Rendimento dos juros ultrapassa R$ 8.500
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Em 5 Anos (60 meses)
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatBRL(
                ((totalMonthlyPlan + extraDepositSimulation) * 60) * 1.35
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Base sólida para aposentadoria e independência
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
