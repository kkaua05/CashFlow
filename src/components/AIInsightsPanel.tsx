import { useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { generateAIInsights, predictNextMonth } from '../lib/aiEngine';
import { BrainCircuit, Sparkles, TrendingUp } from 'lucide-react';

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AIInsightsPanel() {
  const { inputs, history } = useBudgetStore();
  
  const { insights, prediction } = useMemo(() => ({
    insights: generateAIInsights(inputs, history),
    prediction: predictNextMonth(history)
  }), [inputs, history]);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg shadow-lg shadow-purple-500/10">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">IA Financeira</h3>
          <p className="text-xs text-gray-500">Análise preditiva 100% offline</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-6 text-gray-600">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Preencha seus gastos e salve ao menos 2 meses para ativar a IA.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {insights.map((text, i) => (
            <div key={i} className="flex gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-indigo-500/30 transition">
              <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}

      {prediction !== null && (
        <div className="mt-2 p-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-300" />
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Previsão Próximo Mês</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatBRL(prediction)}</p>
          <p className="text-xs text-gray-400 mt-1">Modelo de regressão linear ajustado ao seu histórico</p>
        </div>
      )}
    </div>
  );
}