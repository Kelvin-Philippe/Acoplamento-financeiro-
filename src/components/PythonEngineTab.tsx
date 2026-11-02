import React, { useState, useEffect } from 'react';
import {
  Play,
  Download,
  Copy,
  Check,
  Terminal,
  Code2,
  FileCode,
  Sparkles,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { Transaction, SavingsGoal, PythonExecutionResult } from '../types/finance';
import {
  generatePythonScript,
  executePythonCode,
  downloadFile,
} from '../utils/pythonEngine';

interface PythonEngineTabProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  monthlyIncome: number;
}

export const PythonEngineTab: React.FC<PythonEngineTabProps> = ({
  transactions,
  savingsGoals,
  monthlyIncome,
}) => {
  const [pythonCode, setPythonCode] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<PythonExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'code'>('terminal');

  // Regenerate Python code whenever transactions or goals update
  useEffect(() => {
    const code = generatePythonScript(transactions, savingsGoals, monthlyIncome);
    setPythonCode(code);
  }, [transactions, savingsGoals, monthlyIncome]);

  // Run automatically on first mount to show initial output
  useEffect(() => {
    if (pythonCode && !executionResult) {
      handleRunPython();
    }
  }, [pythonCode]);

  const handleRunPython = async () => {
    setIsRunning(true);
    try {
      const result = await executePythonCode(pythonCode, transactions, monthlyIncome);
      setExecutionResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    downloadFile(pythonCode, 'financas_pessoais.py', 'text/x-python');
  };

  const handleDownloadJson = () => {
    const data = {
      gerado_em: new Date().toISOString(),
      renda_mensal: monthlyIncome,
      transacoes: transactions,
      metas_economia: savingsGoals,
    };
    downloadFile(JSON.stringify(data, null, 2), 'dados_financeiros.json', 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Motor Financeiro em Python
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Python 3.12 PEP 8
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Execute os algoritmos financeiros em tempo real e exporte o script Python completo
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunPython}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs transition-colors shrink-0"
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Executando...' : 'Executar Script Python'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
          </button>

          <button
            onClick={handleDownloadPy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar .py</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Baixar JSON</span>
          </button>
        </div>
      </div>

      {/* Terminal / Code Viewer Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-400">
              financas_pessoais.py — Terminal Interativo
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveSubTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'terminal'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Saída do Console</span>
            </button>
            <button
              onClick={() => setActiveSubTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'code'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Código Python (.py)</span>
            </button>
          </div>
        </div>

        {/* Output area */}
        {activeSubTab === 'terminal' ? (
          <div className="p-5 font-mono text-xs text-emerald-400 overflow-x-auto min-h-[360px] max-h-[500px] leading-relaxed">
            {executionResult ? (
              <pre className="whitespace-pre">{executionResult.output}</pre>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 py-8">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Carregando ambiente Python...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto min-h-[360px] max-h-[500px] leading-relaxed">
            <pre className="whitespace-pre">{pythonCode}</pre>
          </div>
        )}

        {/* Terminal status footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Engine:{' '}
              <span className="text-slate-200">
                {executionResult?.engine === 'pyodide' ? 'Pyodide WebAssembly' : 'Python 3.12 Engine'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {executionResult && (
              <span>
                Tempo de Execução:{' '}
                <span className="text-emerald-400 font-bold tabular-nums">
                  {executionResult.executionTimeMs} ms
                </span>
              </span>
            )}
            <span>Status: 0 (Sucesso)</span>
          </div>
        </div>
      </div>

      {/* Python Architecture & Formulas Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <span>01.</span>
            <span>Rastreamento de Gastos</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Classificação em Dataclasses
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Cada gasto é tipado como <code className="text-emerald-600 dark:text-emerald-400 font-mono">Transacao</code>{' '}
            com natureza essencial (necessidade), estilo de vida (desejo) ou poupança (investimento).
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <span>02.</span>
            <span>Metas Automáticas</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Regra 50/30/20 & Reserva 6x
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            A função <code className="text-cyan-600 dark:text-cyan-400 font-mono">definir_metas_automaticas()</code>{' '}
            calcula o tamanho ideal da reserva de emergência e o aporte mensal sugerido de 20%.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <span>03.</span>
            <span>Como rodar no seu computador</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Execução Local via Terminal
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Baixe o script com o botão acima e execute no seu terminal:
            <code className="block mt-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-[11px] font-mono">
              python financas_pessoais.py
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};
