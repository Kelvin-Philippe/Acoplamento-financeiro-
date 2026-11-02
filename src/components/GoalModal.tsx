import React, { useState, useEffect } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { SavingsGoal, AutoRuleType } from '../types/finance';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id'>, editId?: string) => void;
  editingGoal?: SavingsGoal | null;
  essentialMonthlyExpenses: number;
  monthlyIncome: number;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
  essentialMonthlyExpenses,
  monthlyIncome,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Segurança Financeira');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [autoRuleType, setAutoRuleType] = useState<AutoRuleType>('custom');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setCategory(editingGoal.category);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setDeadline(editingGoal.deadline || '');
      setMonthlyContribution(editingGoal.monthlyTargetContribution.toString());
      setAutoRuleType(editingGoal.autoRuleType);
      setColor(editingGoal.color);
      setNotes(editingGoal.notes || '');
    } else {
      setTitle('');
      setCategory('Metas de Curto/Médio Prazo');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setMonthlyContribution('');
      setAutoRuleType('custom');
      setColor('#10b981');
      setNotes('');
    }
  }, [editingGoal, isOpen]);

  // Recalculate monthly contribution if target or deadline changes
  const handleRecalculateMonthly = () => {
    const target = parseFloat(targetAmount.replace(',', '.'));
    const current = parseFloat(currentAmount.replace(',', '.')) || 0;
    if (isNaN(target) || target <= current) return;

    if (deadline) {
      const now = new Date();
      const end = new Date(deadline);
      const months = Math.max(
        1,
        (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
      );
      const monthly = (target - current) / months;
      setMonthlyContribution(monthly.toFixed(2));
    }
  };

  const applyPreset = (preset: 'emergency' | 'rule_50_30_20' | 'car' | 'trip') => {
    if (preset === 'emergency') {
      const target = Math.round((essentialMonthlyExpenses || 3500) * 6);
      setTitle('Reserva de Emergência (6 Meses)');
      setCategory('Segurança Financeira');
      setTargetAmount(target.toString());
      const monthly = Math.round(target / 12);
      setMonthlyContribution(monthly.toString());
      setAutoRuleType('emergency_fund');
      setColor('#10b981');
      setNotes(`Baseada em R$ ${(essentialMonthlyExpenses || 3500).toFixed(2)} de custos essenciais mensais.`);
    } else if (preset === 'rule_50_30_20') {
      const monthly = Math.round((monthlyIncome || 6000) * 0.2);
      const target = monthly * 12;
      setTitle('Aporte Regra 50/30/20 (20%)');
      setCategory('Investimentos');
      setTargetAmount(target.toString());
      setMonthlyContribution(monthly.toString());
      setAutoRuleType('rule_50_30_20');
      setColor('#06b6d4');
      setNotes(`20% da renda mensal (R$ ${monthly.toFixed(2)}/mês) para independência.`);
    } else if (preset === 'trip') {
      setTitle('Férias & Viagem dos Sonhos');
      setCategory('Estilo de Vida');
      setTargetAmount('8000');
      setMonthlyContribution('800');
      setAutoRuleType('custom');
      setColor('#f59e0b');
      setNotes('Meta para passagens, seguro viagem e hospedagem.');
    } else if (preset === 'car') {
      setTitle('Troca ou Compra de Veículo');
      setCategory('Bens e Patrimônio');
      setTargetAmount('35000');
      setMonthlyContribution('1500');
      setAutoRuleType('custom');
      setColor('#8b5cf6');
      setNotes('Entrada programada sem juros de financiamento.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(',', '.'));
    const current = parseFloat(currentAmount.replace(',', '.')) || 0;
    const monthly = parseFloat(monthlyContribution.replace(',', '.')) || (target - current) / 12;

    if (isNaN(target) || target <= 0) return;
    if (!title.trim()) return;

    const remaining = Math.max(0, target - current);
    const estimatedMonths = monthly > 0 ? Math.ceil(remaining / monthly) : 12;

    onSave(
      {
        title: title.trim(),
        category,
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || undefined,
        monthlyTargetContribution: Math.round(monthly * 100) / 100,
        autoRuleType,
        isAutoGenerated: autoRuleType !== 'custom',
        color,
        icon: 'Target',
        notes: notes.trim(),
        estimatedMonthsRemaining: estimatedMonths,
      },
      editingGoal ? editingGoal.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingGoal ? 'Editar Meta Financeira' : 'Nova Meta de Economia'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick presets */}
          {!editingGoal && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Modelos Automáticos Populares
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('emergency')}
                  className="px-2.5 py-1.5 text-xs text-left font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/80 transition-colors"
                >
                  <span className="block font-semibold text-emerald-600 dark:text-emerald-400">
                    🛡️ Reserva Emergencial
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    6x gastos essenciais
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('rule_50_30_20')}
                  className="px-2.5 py-1.5 text-xs text-left font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 bg-slate-50 dark:bg-slate-800/80 transition-colors"
                >
                  <span className="block font-semibold text-cyan-600 dark:text-cyan-400">
                    📈 Regra 50/30/20
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    20% da sua renda mensal
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Meta
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reserva de Emergência, Entrada do Apartamento..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Target Amount & Current Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Total Alvo (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Já Acumulado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Deadline & Monthly Contribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Limite Desejada
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Aporte Mensal Calculado
                </label>
                {deadline && (
                  <button
                    type="button"
                    onClick={handleRecalculateMonthly}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Calcular</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Color & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria da Meta
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Segurança Financeira">Segurança Financeira</option>
                <option value="Investimentos">Investimentos & Longo Prazo</option>
                <option value="Estilo de Vida">Estilo de Vida & Viagens</option>
                <option value="Bens e Patrimônio">Bens e Aquisições</option>
                <option value="Outros">Outras Conquistas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cor de Identificação
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-110 border-slate-900 dark:border-white shadow-xs' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações ou Detalhes da Regra
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Onde o dinheiro está aplicado (Tesouro Selic, CDB...), taxa de rentabilidade, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{editingGoal ? 'Salvar Alterações' : 'Criar Meta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
