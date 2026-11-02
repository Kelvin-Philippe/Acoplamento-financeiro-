import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Transaction, Category } from '../types/finance';
import { formatBRL, formatDateBR } from '../utils/currency';
import { downloadFile } from '../utils/pythonEngine';

interface TransactionsTabProps {
  transactions: Transaction[];
  categories: Category[];
  onNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  categories,
  onNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [natureFilter, setNatureFilter] = useState<'all' | 'essential' | 'lifestyle' | 'savings'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Outros';
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      getCategoryName(t.categoryId).toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesNature = natureFilter === 'all' || t.nature === natureFilter;
    const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;

    return matchesSearch && matchesType && matchesNature && matchesCategory;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Descricao', 'Valor', 'Tipo', 'Categoria', 'Natureza_50_30_20', 'Metodo', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.type,
      `"${getCategoryName(t.categoryId)}"`,
      t.nature,
      t.paymentMethod,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadFile(csvContent, `transacoes_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Extrato de Gastos e Receitas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie cada transação e classifique para calibrar as metas automáticas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descrição, mercado, aluguel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Receitas
            </button>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={natureFilter}
            onChange={(e) => setNatureFilter(e.target.value as any)}
            className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
          >
            <option value="all">Todas as Naturezas (50/30/20)</option>
            <option value="essential">Necessidades (50%)</option>
            <option value="lifestyle">Desejos & Lazer (30%)</option>
            <option value="savings">Poupança & Aportes (20%)</option>
          </select>

          {(search || typeFilter !== 'all' || natureFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setNatureFilter('all');
                setCategoryFilter('all');
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Regra 50/30/20</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-medium">Nenhuma transação encontrada</p>
                    <p className="text-[11px] mt-1">
                      Ajuste os filtros de busca ou crie uma nova transação.
                    </p>
                    <button
                      onClick={onNewTransaction}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      Cadastrar Primeira Transação
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {formatDateBR(tx.date)}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-[240px] truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{tx.description}</span>
                        {tx.recurring && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Recorrente)
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {tx.notes}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {getCategoryName(tx.categoryId)}
                    </td>

                    {/* 50/30/20 Nature */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.type === 'income' ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Receita Operacional
                        </span>
                      ) : tx.nature === 'essential' ? (
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          Necessidade (50%)
                        </span>
                      ) : tx.nature === 'lifestyle' ? (
                        <span className="text-[11px] text-fuchsia-600 dark:text-fuchsia-400 font-medium">
                          Desejo / Lazer (30%)
                        </span>
                      ) : (
                        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                          Poupança / Aporte (20%)
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 uppercase text-[11px]">
                      {tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums font-semibold">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }
                      >
                        {tx.type === 'income' ? '+ ' : '- '}
                        {formatBRL(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Editar"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Excluir"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Exibindo {filteredTransactions.length} de {transactions.length} lançamentos
          </span>
          <span className="font-mono tabular-nums">
            Total exibido:{' '}
            {formatBRL(
              filteredTransactions.reduce(
                (sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount),
                0
              )
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
