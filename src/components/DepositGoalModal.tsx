import React, { useState } from 'react';
import { X, PiggyBank, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types/finance';
import { formatBRL } from '../utils/currency';

interface DepositGoalModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (goalId: string, amount: number) => void;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onDeposit,
}) => {
  const [depositAmount, setDepositAmount] = useState('');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;

    const newTotal = goal.currentAmount + parsed;
    if (newTotal >= goal.targetAmount) {
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }

    onDeposit(goal.id, parsed);
    setDepositAmount('');
    onClose();
  };

  const setSuggested = (val: number) => {
    setDepositAmount(val.toFixed(2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Fazer Aporte na Meta
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal status summary */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Acumulado Atual:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {formatBRL(goal.currentAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Meta Final:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {formatBRL(goal.targetAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Falta para concluir:</span>
              <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(remaining)}
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sugestões Rápidas de Aporte
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSuggested(goal.monthlyTargetContribution || 500)}
                className="px-2 py-1.5 text-xs font-mono font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                {formatBRL(goal.monthlyTargetContribution || 500)}
              </button>
              <button
                type="button"
                onClick={() => setSuggested(Math.min(remaining, 500))}
                className="px-2 py-1.5 text-xs font-mono font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                R$ 500,00
              </button>
              <button
                type="button"
                onClick={() => setSuggested(remaining)}
                className="px-2 py-1.5 text-xs font-mono font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Quitar Meta
              </button>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Valor a Depositar (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0,00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-base font-mono tabular-nums font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirmar Depósito</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
