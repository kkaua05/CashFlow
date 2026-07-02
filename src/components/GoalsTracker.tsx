import { useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { Plus, Trash2, Target, Trophy } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function GoalsTracker() {
  const { goals, addGoal, updateGoalProgress, removeGoal } = useBudgetStore();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const handleAdd = () => {
    if (!name || !target) return;
    addGoal({ name, target: parseFloat(target) || 0, current: 0, priority: 'medium' });
    setName('');
    setTarget('');
  };

  const totalProgress = goals.length > 0
    ? goals.reduce((acc, g) => acc + (g.current / g.target) * 100, 0) / goals.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Metas Financeiras</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Acompanhe seu progresso</p>
            </div>
          </div>
          {goals.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progresso Médio</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalProgress.toFixed(1)}%</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <input
            type="text"
            placeholder="Nome da meta (ex: Viagem, Carro)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 rounded-lg border-2 border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
          />
          <div className="relative w-40">
            <input
              type="number"
              placeholder="Valor alvo"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>

        <div className="space-y-4">
          {goals.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Nenhuma meta criada</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Comece adicionando sua primeira meta financeira</p>
            </div>
          )}
          
          {goals.map(g => {
            const progress = g.target > 0 ? (g.current / g.target) * 100 : 0;
            const isComplete = progress >= 100;
            
            return (
              <div
                key={g.id}
                className={`group p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  isComplete
                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/30 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{g.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatCurrency(g.current)} de {formatCurrency(g.target)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {progress.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => removeGoal(g.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      isComplete ? 'bg-linear-to-r from-emerald-500 to-emerald-400' : 'bg-linear-to-r from-indigo-600 to-purple-600'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                
                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    max={g.target}
                    step="10"
                    value={g.current}
                    onChange={e => updateGoalProgress(g.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}