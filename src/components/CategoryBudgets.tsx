import { useState, useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { AlertTriangle, Edit3, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { EXPENSE_CATEGORIES } from '../types';
import type { ExpenseCategoryType, BudgetInputs } from '../types';

interface CategoryConfig {
  id: string;
  label: string;
  val: (inputs: BudgetInputs) => number;
  color: string;
  expenseCategory?: ExpenseCategoryType;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'helpAtHome', label: 'Ajuda em Casa', val: (i) => i.helpAtHome, color: 'indigo' },
  { id: 'saveAmount', label: 'Guardar (Poupança)', val: (i) => i.saveAmount, color: 'emerald' },
  { id: 'emergencyFund', label: 'Imprevistos', val: (i) => i.emergencyFund, color: 'amber' },
  { id: 'dailyFood', label: 'Alimentação', val: (i) => 0, color: 'orange', expenseCategory: 'alimentacao' },
  { id: 'dailyTransport', label: 'Transporte', val: (i) => 0, color: 'blue', expenseCategory: 'transporte' },
  { id: 'dailyLeisure', label: 'Lazer', val: (i) => 0, color: 'purple', expenseCategory: 'lazer' },
  { id: 'dailyHealth', label: 'Saúde', val: (i) => 0, color: 'green', expenseCategory: 'saude' },
  { id: 'dailyEducation', label: 'Educação', val: (i) => 0, color: 'indigo', expenseCategory: 'educacao' },
  { id: 'dailyShopping', label: 'Compras', val: (i) => 0, color: 'amber', expenseCategory: 'compras' },
  { id: 'dailyOther', label: 'Outros Gastos', val: (i) => 0, color: 'gray', expenseCategory: 'outros' },
  { id: 'available', label: 'Disponível', val: (i) => Math.max(0, i.salary - i.helpAtHome - i.saveAmount - i.emergencyFund), color: 'gray' },
];

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
};

export default function CategoryBudgets() {
  const { inputs, categoryBudgets, setCategoryBudget, dailyExpenses } = useBudgetStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');

  // Calculate spending per expense category for current month
  const spendingByCategory = useMemo(() => {
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const monthExpenses = dailyExpenses.filter(
      e => e.date.startsWith(`${year}-${monthStr}`)
    );

    const totals: Record<string, number> = {};
    monthExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [dailyExpenses]);

  const handleSave = (id: string) => {
    setCategoryBudget(id, parseFloat(tempLimit) || 0);
    setEditId(null);
  };

  const getSpentForCategory = (cat: CategoryConfig): number => {
    if (cat.expenseCategory) {
      return spendingByCategory[cat.expenseCategory] || 0;
    }
    return cat.val(inputs);
  };

  return (
    <div className="bg-[#0c0c0d] rounded-xl border border-white/[0.04] p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingDown className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Orçamento por Categoria</h3>
      </div>
      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const spent = getSpentForCategory(cat);
          const budget = categoryBudgets.find(b => b.category === cat.id)?.limit || 0;
          const percent = budget > 0 ? (spent / budget) * 100 : 0;
          const isOver = budget > 0 && spent > budget;
          const isNear = percent > 80 && !isOver;
          const barColor = isOver ? 'bg-red-500' : isNear ? 'bg-yellow-500' : COLOR_MAP[cat.color] || 'bg-indigo-500';

          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-300">{cat.label}</span>
                  {budget > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isOver ? 'bg-red-500/20 text-red-400' : isNear ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {Math.round(percent)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-500">
                    {formatCurrency(spent)} {budget > 0 ? `/ ${formatCurrency(budget)}` : ''}
                  </span>
                  <button 
                    onClick={() => { setEditId(cat.id); setTempLimit(budget.toString()); }} 
                    className="text-gray-700 hover:text-gray-400 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {editId === cat.id ? (
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={tempLimit} 
                    onChange={e => setTempLimit(e.target.value)} 
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" 
                    placeholder="Limite mensal"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSave(cat.id)} 
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    OK
                  </button>
                  <button 
                    onClick={() => setEditId(null)} 
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${Math.min(100, budget > 0 ? percent : 0)}%` }}
                  />
                </div>
              )}

              {isOver && (
                <div className="flex items-center gap-1 text-[11px] text-red-400">
                  <AlertTriangle className="w-3 h-3" /> Excedido em {formatCurrency(spent - budget)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}