import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { SavingsGoalsTab } from './components/SavingsGoalsTab';
import { PythonEngineTab } from './components/PythonEngineTab';
import { TransactionModal } from './components/TransactionModal';
import { DepositGoalModal } from './components/DepositGoalModal';
import { GoalModal } from './components/GoalModal';
import { Transaction, SavingsGoal } from './types/finance';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_SAVINGS_GOALS } from './data/mockData';
import { generateSmartAutoGoals } from './utils/autoGoalsEngine';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('pyfinancas_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pyfinancas_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pyfinancas_theme', 'light');
    }
  }, [isDark]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'goals' | 'python'>('overview');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pyfinancas_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Goals state
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('pyfinancas_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SAVINGS_GOALS;
      }
    }
    return INITIAL_SAVINGS_GOALS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pyfinancas_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pyfinancas_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Aggregated values
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const essentialMonthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'essential')
    .reduce((sum, t) => sum + t.amount, 0);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Transaction handlers
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, editId?: string) => {
    if (editId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? { ...txData, id: editId } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Goal handlers
  const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id'>, editId?: string) => {
    if (editId) {
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === editId ? { ...goalData, id: editId } : g))
      );
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal_${Date.now()}`,
      };
      setSavingsGoals((prev) => [...prev, newGoal]);
    }
  };

  const handleDeleteGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDeposit = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + amount;
          const remaining = Math.max(0, g.targetAmount - newCurrent);
          const estimatedMonths =
            g.monthlyTargetContribution > 0
              ? Math.ceil(remaining / g.monthlyTargetContribution)
              : 0;
          return {
            ...g,
            currentAmount: newCurrent,
            estimatedMonthsRemaining: estimatedMonths,
          };
        }
        return g;
      })
    );

    // Also register an expense transaction under savings/investment
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Aporte Meta: ${targetGoal?.title || 'Poupança'}`,
      amount,
      type: 'expense',
      categoryId: 'cat_investimentos',
      nature: 'savings',
      paymentMethod: 'pix',
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAutoGenerateGoals = (months: number = 6) => {
    const updated = generateSmartAutoGoals(
      totalIncome,
      transactions,
      savingsGoals,
      months
    );
    setSavingsGoals(updated);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo padrão?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setSavingsGoals(INITIAL_SAVINGS_GOALS);
      localStorage.removeItem('pyfinancas_transactions');
      localStorage.removeItem('pyfinancas_goals');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            transactions={transactions}
            savingsGoals={savingsGoals}
            categories={DEFAULT_CATEGORIES}
            onOpenDeposit={(goal) => {
              setSelectedGoalForDeposit(goal);
              setIsDepositModalOpen(true);
            }}
            onNavigateTab={setActiveTab}
            onNewTransaction={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            categories={DEFAULT_CATEGORIES}
            onNewTransaction={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsTab
            savingsGoals={savingsGoals}
            transactions={transactions}
            monthlyIncome={totalIncome}
            essentialMonthlyExpenses={essentialMonthlyExpenses}
            onOpenDeposit={(goal) => {
              setSelectedGoalForDeposit(goal);
              setIsDepositModalOpen(true);
            }}
            onNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onAutoGenerateGoals={handleAutoGenerateGoals}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'python' && (
          <PythonEngineTab
            transactions={transactions}
            savingsGoals={savingsGoals}
            monthlyIncome={totalIncome}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">PyFinanças</span>
            <span aria-hidden="true">·</span>
            <span>Rastreamento Financeiro & Metas Automáticas em Python 3.12</span>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Dados Padrão</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={DEFAULT_CATEGORIES}
        editingTransaction={editingTx}
      />

      <DepositGoalModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handleDeposit}
        goal={selectedGoalForDeposit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
        essentialMonthlyExpenses={essentialMonthlyExpenses}
        monthlyIncome={totalIncome}
      />
    </div>
  );
}
