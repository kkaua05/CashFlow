import { useState, useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency, cn } from '../lib/utils';
import { EXPENSE_CATEGORIES } from '../types';
import type { ExpenseCategoryType } from '../types';
import {
  PieChart,
  TrendingDown,
  Calendar,
  ArrowUpDown,
  Download,
  Trash2,
  Filter,
  Search,
} from 'lucide-react';

export default function SpendingAnalysis() {
  const { dailyExpenses, removeDailyExpense, inputs } = useBudgetStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategoryType | 'all'>('all');

  const filteredExpenses = useMemo(() => {
    let items = [...dailyExpenses];

    // Period filter
    if (period !== 'all') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      items = items.filter(e => e.date >= cutoffStr);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      items = items.filter(e => e.category === categoryFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(e => e.description.toLowerCase().includes(term));
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyExpenses, period, categoryFilter, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;
    const byCategory: Record<string, { total: number; count: number }> = {};

    filteredExpenses.forEach(e => {
      if (!byCategory[e.category]) {
        byCategory[e.category] = { total: 0, count: 0 };
      }
      byCategory[e.category].total += e.amount;
      byCategory[e.category].count += 1;
    });

    const categoryData = EXPENSE_CATEGORIES.map(cat => ({
      category: cat.value,
      label: cat.label,
      color: cat.color,
      total: byCategory[cat.value]?.total || 0,
      count: byCategory[cat.value]?.count || 0,
      percentage: total > 0 ? ((byCategory[cat.value]?.total || 0) / total) * 100 : 0,
    }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryData[0];

    return { total, avg, count: filteredExpenses.length, categoryData, topCategory };
  }, [filteredExpenses]);

  // Daily spending for chart
  const dailyChartData = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      daily[e.date] = (daily[e.date] || 0) + e.amount;
    });
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [filteredExpenses]);

  const getCategoryColor = (cat: ExpenseCategoryType) => {
    return EXPENSE_CATEGORIES.find(c => c.value === cat)?.color || '#6b7280';
  };

  const getCategoryLabel = (cat: ExpenseCategoryType) => {
    return EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || 'Outros';
  };

  const exportData = () => {
    const csv = [
      ['Data', 'Descrição', 'Categoria', 'Valor'].join(','),
      ...filteredExpenses.map(e => 
        [e.date, `"${e.description}"`, getCategoryLabel(e.category), e.amount.toFixed(2)].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Análise de Gastos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.count} gastos encontrados · Total: {formatCurrency(stats.total)}
          </p>
        </div>
        {dailyExpenses.length > 0 && (
          <button
            onClick={exportData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-xs text-gray-400 hover:text-white transition-all border border-white/[0.06]"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
          {([
            { value: '7d', label: '7 Dias' },
            { value: '30d', label: '30 Dias' },
            { value: '90d', label: '90 Dias' },
            { value: 'all', label: 'Todo Período' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium transition-colors",
                period === opt.value
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-gray-500 hover:text-gray-300 bg-transparent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar gastos..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategoryType | 'all')}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="all">Todas Categorias</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {dailyExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
            <PieChart className="w-7 h-7" />
          </div>
          <p className="text-base font-medium text-gray-500">Nenhum gasto registrado</p>
          <p className="text-sm text-gray-600 mt-1">Adicione gastos no Dashboard para ver análises detalhadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Total Gasto</p>
              <p className="text-lg font-bold text-white">{formatCurrency(stats.total)}</p>
            </div>
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Média por Gasto</p>
              <p className="text-lg font-bold text-white">{formatCurrency(stats.avg)}</p>
            </div>
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Total de Gastos</p>
              <p className="text-lg font-bold text-white">{stats.count}</p>
            </div>
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Maior Categoria</p>
              <p className="text-lg font-bold text-white truncate">
                {stats.topCategory ? stats.topCategory.label : '-'}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white mb-4">Gastos por Categoria</h3>
              <div className="space-y-3">
                {stats.categoryData.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-gray-400">{cat.label}</span>
                        <span className="text-[10px] text-gray-600">{cat.count}x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{formatCurrency(cat.total)}</span>
                        <span className="text-[10px] text-gray-600 w-10 text-right">{cat.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily chart - simple bar representation */}
            {dailyChartData.length > 0 && (
              <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
                <h3 className="text-sm font-semibold text-white mb-4">Gastos por Dia</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {dailyChartData.slice(-30).map((day) => {
                    const maxAmount = Math.max(...dailyChartData.slice(-30).map(d => d.amount));
                    return (
                      <div key={day.date} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-20 flex-shrink-0">
                          {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <div className="flex-1 h-5 bg-white/[0.02] rounded overflow-hidden flex items-center">
                          <div
                            className="h-full bg-red-500/40 rounded-r transition-all"
                            style={{ width: `${(day.amount / maxAmount) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 w-16 text-right font-medium">
                          {formatCurrency(day.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Top Expenses List */}
          <div className="space-y-3">
            <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white mb-4">Últimos Gastos</h3>
              <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredExpenses.slice(0, 50).map((expense) => (
                  <div
                    key={expense.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.02] transition-all"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{expense.description}</p>
                      <p className="text-[10px] text-gray-600">
                        {getCategoryLabel(expense.category)} · {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-white">{formatCurrency(expense.amount)}</p>
                    <button
                      onClick={() => removeDailyExpense(expense.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {stats.topCategory && (
              <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-xl p-4 border border-red-500/10">
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Maior Gasto</p>
                <p className="text-sm font-bold text-white">{stats.topCategory.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatCurrency(stats.topCategory.total)} · {stats.topCategory.percentage.toFixed(0)}% do total
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}