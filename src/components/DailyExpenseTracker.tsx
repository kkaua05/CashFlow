import { useState, useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency, cn } from '../lib/utils';
import {
  Plus,
  Trash2,
  Utensils,
  Car,
  Gamepad2,
  Heart,
  BookOpen,
  Home,
  Radio,
  ShoppingBag,
  MoreHorizontal,
  Calendar,
  Wallet,
  TrendingDown,
  AlertCircle,
  X,
  ChevronDown,
  PieChart,
} from 'lucide-react';
import type { ExpenseCategoryType, DailyExpense, SpendingByCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../types';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Car,
  Gamepad2,
  Heart,
  BookOpen,
  Home,
  Radio,
  ShoppingBag,
  MoreHorizontal,
};

export default function DailyExpenseTracker() {
  const { dailyExpenses, addDailyExpense, removeDailyExpense, inputs } = useBudgetStore();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryType>('alimentacao');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategoryType | 'all'>('all');
  const [filterDate, setFilterDate] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let filtered = [...dailyExpenses];

    // Date filter
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    switch (filterDate) {
      case 'today':
        filtered = filtered.filter(e => e.date === today);
        break;
      case 'week':
        filtered = filtered.filter(e => e.date >= weekAgo && e.date <= today);
        break;
      case 'month':
        filtered = filtered.filter(e => e.date >= monthStart && e.date <= today);
        break;
      case 'custom':
        if (customStart && customEnd) {
          filtered = filtered.filter(e => e.date >= customStart && e.date <= customEnd);
        }
        break;
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyExpenses, filterDate, filterCategory, customStart, customEnd]);

  // Spending by category for the period
  const spendingByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    filteredExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      counts[e.category] = (counts[e.category] || 0) + 1;
    });

    return EXPENSE_CATEGORIES.map(cat => ({
      category: cat.value,
      total: totals[cat.value] || 0,
      count: counts[cat.value] || 0,
      percentage: totalSpent > 0 ? ((totals[cat.value] || 0) / totalSpent) * 100 : 0,
    })).filter(s => s.total > 0).sort((a, b) => b.total - a.total) as SpendingByCategory[];
  }, [filteredExpenses]);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyTotal = dailyExpenses
    .filter(e => e.date === new Date().toISOString().split('T')[0])
    .reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!numAmount || numAmount <= 0) return;
    if (!description.trim()) return;

    addDailyExpense({
      amount: numAmount,
      category,
      description: description.trim(),
      date,
    });

    setAmount('');
    setDescription('');
    setCategory('alimentacao');
    setShowForm(false);
  };

  const getCategoryInfo = (cat: ExpenseCategoryType) => {
    return EXPENSE_CATEGORIES.find(c => c.value === cat) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  };

  const getCategoryIcon = (cat: ExpenseCategoryType) => {
    const info = getCategoryInfo(cat);
    const Icon = CATEGORY_ICONS[info.icon] || MoreHorizontal;
    return <Icon className="w-3.5 h-3.5" />;
  };

  const hasData = dailyExpenses.length > 0;
  const todayExpenses = dailyExpenses.filter(e => e.date === new Date().toISOString().split('T')[0]);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Gastos Diários</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Registre tudo que gasta durante o dia
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
            showForm
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
          )}
        >
          {showForm ? (
            <><X className="w-3.5 h-3.5" /> Fechar</>
          ) : (
            <><Plus className="w-3.5 h-3.5" /> Novo Gasto</>
          )}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.06] space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Almoço, Uber, Cinema..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
              Categoria
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon] || MoreHorizontal;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                      isSelected
                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                        : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!amount || !description.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Adicionar Gasto
            </button>
          </div>
        </div>
      )}

      {/* Today's quick summary */}
      {todayTotal > 0 && (
        <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-xl p-3 border border-red-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Gastos de hoje</p>
              <p className="text-sm font-bold text-white">{formatCurrency(todayTotal)}</p>
            </div>
          </div>
          <span className="text-xs text-gray-600">{todayExpenses.length} registro(s)</span>
        </div>
      )}

      {/* Filters */}
      {hasData && (
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
            {([
              { value: 'today', label: 'Hoje' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
              { value: 'custom', label: 'Período' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterDate(opt.value)}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                  filterDate === opt.value
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-gray-500 hover:text-gray-300 bg-transparent"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategoryType | 'all')}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-gray-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">Todas Categorias</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {filterDate === 'custom' && (
            <div className="flex gap-1 items-center">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-white"
              />
              <span className="text-gray-600 text-[11px]">até</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-white"
              />
            </div>
          )}
        </div>
      )}

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Nenhum gasto registrado</p>
          <p className="text-xs text-gray-600 mt-1">Clique em "Novo Gasto" para começar a controlar seus gastos diários</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Expense List */}
          <div className="lg:col-span-2 space-y-2">
            {/* Summary bar */}
            <div className="bg-[#0c0c0d] rounded-xl px-4 py-3 border border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {filteredExpenses.length} gasto(s)
                </span>
                <span className="text-gray-700">|</span>
                <span className="text-xs text-gray-500">
                  Média: {filteredExpenses.length > 0 ? formatCurrency(totalFiltered / filteredExpenses.length) : 'R$ 0'}
                </span>
              </div>
              <p className="text-sm font-bold text-white">{formatCurrency(totalFiltered)}</p>
            </div>

            {/* Expense items */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredExpenses.map((expense) => {
                const catInfo = getCategoryInfo(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="group flex items-center gap-3 bg-[#0c0c0d] hover:bg-white/[0.02] rounded-xl px-4 py-2.5 border border-white/[0.04] transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
                    >
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium"
                          style={{ color: catInfo.color }}
                        >
                          {catInfo.label}
                        </span>
                        <span className="text-gray-700">•</span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        onClick={() => removeDailyExpense(expense.id)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spending by Category */}
          {spendingByCategory.length > 0 && (
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04] h-fit">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Por Categoria</h3>
              </div>
              <div className="space-y-3">
                {spendingByCategory.map((item) => {
                  const catInfo = getCategoryInfo(item.category);
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: catInfo.color }}
                          />
                          <span className="text-xs text-gray-400">{catInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{item.count}x</span>
                          <span className="text-xs font-semibold text-white">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: catInfo.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {spendingByCategory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <p className="text-[11px] text-gray-600">
                    Maior gasto: <span className="text-white font-medium">
                      {getCategoryInfo(spendingByCategory[0].category).label}
                    </span>
                    {' · '}{formatCurrency(spendingByCategory[0].total)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}