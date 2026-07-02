import { useBudgetStore } from '../store/budgetStore';
import { useBudgetLogic } from '../hooks/useBudgetLogic';
import { AlertTriangle, CheckCircle, Lightbulb, XCircle, TrendingUp } from 'lucide-react';
import type { Suggestion } from '../types';

const icons: Record<string, React.ReactNode> = {
  alert: <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>,
  warning: <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>,
  tip: <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>,
  success: <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>,
};

const borders: Record<string, string> = {
  alert: 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10',
  warning: 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10',
  tip: 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10',
  success: 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10',
};

export default function SuggestionsPanel() {
  const { inputs } = useBudgetStore();
  const { suggestions } = useBudgetLogic(inputs);

  return (
    <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Análise Inteligente</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recomendações personalizadas</p>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
        {suggestions.map((s: Suggestion) => (
          <div 
            key={s.id} 
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${borders[s.type]}`}
          >
            {icons[s.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">{s.message}</p>
              {s.action && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
                  {s.action}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}