import { useState, useMemo, useCallback } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  Legend, ComposedChart
} from 'recharts';
import { useBudgetStore } from '../store/budgetStore';
import { useBudgetLogic } from '../hooks/useBudgetLogic';
import { formatCurrency, cn } from '../lib/utils';
import { EXPENSE_CATEGORIES } from '../types';
import type { ExpenseCategoryType } from '../types';
import { 
  TrendingUp, TrendingDown, Download, Calendar, PieChart as PieChartIcon,
  BarChart3, LineChart as LineChartIcon, Table, Eye, EyeOff, Printer,
  FileDown, AlertCircle, CheckCircle2, Clock, DollarSign, ArrowUpRight,
  ArrowDownRight, Percent, Wallet, Sparkles, Target, Zap, Shield,
  ChevronDown, ChevronUp, Receipt, ShoppingBag, Utensils, Car,
  Gamepad2, Heart, BookOpen, Home, Radio, MoreHorizontal,
  Info, Activity, BarChartHorizontal
} from 'lucide-react';

type ReportType = 'overview' | 'income' | 'savings' | 'expenses' | 'distribution' | 'history';
type PeriodFilter = 'month' | '3months' | '6months' | 'year' | 'all';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  month: 'Este Mês',
  '3months': '3 Meses',
  '6months': '6 Meses',
  year: 'Este Ano',
  all: 'Todo Período',
};

// Custom Tooltip for all charts
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0c0d] border border-white/[0.08] rounded-xl p-4 shadow-2xl shadow-black/50 max-w-xs">
        <p className="text-gray-500 text-[11px] font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 py-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400 text-xs">{entry.name}</span>
            </div>
            <span className="text-white font-semibold text-xs">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils, Car, Gamepad2, Heart, BookOpen, Home, Radio, ShoppingBag, MoreHorizontal,
};

export default function ReportsPage() {
  const { inputs, history, dailyExpenses } = useBudgetStore();
  const { summary } = useBudgetLogic(inputs);
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [showDetails, setShowDetails] = useState(false);

  const currentMonth = MONTH_NAMES[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const available = inputs.salary - inputs.helpAtHome - inputs.saveAmount - inputs.emergencyFund;

  // Process daily expenses
  const expenseAnalysis = useMemo(() => {
    const now = new Date();
    let filtered = [...dailyExpenses];

    // Apply period filter
    switch (periodFilter) {
      case 'month': {
        const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const end = now.toISOString().split('T')[0];
        filtered = filtered.filter(e => e.date >= start && e.date <= end);
        break;
      }
      case '3months': {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        filtered = filtered.filter(e => new Date(e.date) >= start);
        break;
      }
      case '6months': {
        const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        filtered = filtered.filter(e => new Date(e.date) >= start);
        break;
      }
      case 'year': {
        const start = `${now.getFullYear()}-01-01`;
        filtered = filtered.filter(e => e.date >= start);
        break;
      }
    }

    // Category totals
    const catTotals: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    filtered.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
      catCounts[e.category] = (catCounts[e.category] || 0) + 1;
    });

    const totalSpent = filtered.reduce((s, e) => s + e.amount, 0);
    const categoryData = EXPENSE_CATEGORIES.map(cat => ({
      category: cat.value,
      label: cat.label,
      color: cat.color,
      total: catTotals[cat.value] || 0,
      count: catCounts[cat.value] || 0,
      percentage: totalSpent > 0 ? ((catTotals[cat.value] || 0) / totalSpent) * 100 : 0,
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    // Daily spending for chart
    const dailyMap: Record<string, number> = {};
    filtered.forEach(e => {
      dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount;
    });
    const dailyChart = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-31)
      .map(([date, amount]) => ({ date: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), amount }));

    return {
      totalSpent,
      count: filtered.length,
      avgPerExpense: filtered.length > 0 ? totalSpent / filtered.length : 0,
      categoryData,
      dailyChart,
      topCategory: categoryData[0],
    };
  }, [dailyExpenses, periodFilter]);

  // Processar histórico para gráficos
  const historyData = useMemo(() => {
    const sorted = [...history].reverse();
    return sorted.map((h, i) => ({
      month: `${MONTH_NAMES[h.month - 1]?.substring(0, 3) || h.month}/${h.year}`,
      Salário: h.salary,
      'Ajuda em Casa': h.helpAtHome,
      'Guardar': h.saveAmount,
      'Imprevistos': h.emergencyFund,
      'Total Guardado': h.totalSaved,
      'Disponível': h.remaining,
      'Taxa de Economia': h.savingsRate,
    }));
  }, [history]);

  // Dados para gráfico de distribuição
  const distributionData = useMemo(() => {
    const expenseCatTotal = expenseAnalysis.totalSpent;
    return [
      { name: 'Ajuda em Casa', value: inputs.helpAtHome, color: '#6366f1', percentage: inputs.salary > 0 ? (inputs.helpAtHome / inputs.salary * 100) : 0 },
      { name: 'Guardar', value: inputs.saveAmount, color: '#10b981', percentage: inputs.salary > 0 ? (inputs.saveAmount / inputs.salary * 100) : 0 },
      { name: 'Imprevistos', value: inputs.emergencyFund, color: '#f59e0b', percentage: inputs.salary > 0 ? (inputs.emergencyFund / inputs.salary * 100) : 0 },
      { name: 'Gastos Diários', value: expenseCatTotal, color: '#ef4444', percentage: inputs.salary > 0 ? (expenseCatTotal / inputs.salary * 100) : 0 },
      { name: 'Disponível', value: Math.max(0, available - expenseCatTotal), color: '#6b7280', percentage: inputs.salary > 0 ? (Math.max(0, available - expenseCatTotal) / inputs.salary * 100) : 0 },
    ].filter(d => d.value > 0);
  }, [inputs, available, expenseAnalysis.totalSpent]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const avgSaved = history.reduce((acc, h) => acc + h.totalSaved, 0) / history.length;
    const avgAvailable = history.reduce((acc, h) => acc + h.remaining, 0) / history.length;
    const bestMonth = history.reduce((best, h) => h.savingsRate > (best?.savingsRate || 0) ? h : best, history[0]);
    const worstMonth = history.reduce((worst, h) => h.savingsRate < (worst?.savingsRate || Infinity) ? h : worst, history[history.length - 1]);
    const totalSavedAccumulated = history.reduce((acc, h) => acc + h.totalSaved, 0);
    return { avgSaved, avgAvailable, bestMonth, worstMonth, totalSavedAccumulated, monthsTracked: history.length };
  }, [history]);

  const healthScore = useMemo(() => {
    if (inputs.salary === 0) return 0;
    let score = 0;
    if (summary.savingsRate >= 20) score += 30;
    else if (summary.savingsRate >= 10) score += 15;
    if (inputs.emergencyFund > 0) score += 20;
    if (inputs.helpAtHome > 0) score += 10;
    const expenseRatio = expenseAnalysis.totalSpent / inputs.salary;
    if (expenseRatio <= 0.30) score += 30;
    else if (expenseRatio <= 0.50) score += 15;
    if (history.length >= 3) score += 10;
    return Math.min(100, score);
  }, [inputs, summary, expenseAnalysis, history]);

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 70) return 'Saudável';
    if (score >= 40) return 'Atenção';
    return 'Crítico';
  };

  // Overview Report
  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Health Score Card */}
      <div className="bg-gradient-to-br from-[#0c0c0d] to-gray-900 rounded-xl p-6 border border-white/[0.04]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Saúde Financeira</h2>
              <p className="text-[11px] text-gray-500">Score baseado em múltiplos fatores</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - healthScore / 100)}`}
                  className={getHealthColor(healthScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${getHealthColor(healthScore)}`}>{healthScore}</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${getHealthColor(healthScore)}`}>{getHealthLabel(healthScore)}</p>
              <p className="text-[10px] text-gray-600">de 100 pontos</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {summary.savingsRate >= 20 && (
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-lg border border-emerald-500/20">
              ✅ Economia &ge; 20%
            </span>
          )}
          {inputs.emergencyFund > 0 && (
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-medium rounded-lg border border-amber-500/20">
              🛡️ Reserva ativa
            </span>
          )}
          {expenseAnalysis.totalSpent > 0 && expenseAnalysis.totalSpent / inputs.salary <= 0.30 && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-medium rounded-lg border border-blue-500/20">
              📊 Gastos controlados
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Renda</p>
          <p className="text-base font-bold text-white">{formatCurrency(inputs.salary)}</p>
          {inputs.salary > 0 && <p className="text-[10px] text-gray-600 mt-0.5">Mensal líquida</p>}
        </div>
        <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Economia</p>
          <p className="text-base font-bold text-white">{formatCurrency(summary.totalSaved)}</p>
          <p className={`text-[10px] font-medium mt-0.5 ${summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {summary.savingsRate.toFixed(1)}% da renda
          </p>
        </div>
        <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-2">
            <Receipt className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Gastos</p>
          <p className="text-base font-bold text-white">{formatCurrency(expenseAnalysis.totalSpent)}</p>
          {inputs.salary > 0 && (
            <p className={`text-[10px] font-medium mt-0.5 ${expenseAnalysis.totalSpent / inputs.salary <= 0.30 ? 'text-emerald-400' : 'text-red-400'}`}>
              {`${(expenseAnalysis.totalSpent / inputs.salary * 100).toFixed(0)}% da renda`}
            </p>
          )}
        </div>
        <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-400 mb-2">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Disponível</p>
          <p className="text-base font-bold text-white">{formatCurrency(Math.max(0, available - expenseAnalysis.totalSpent))}</p>
          {available - expenseAnalysis.totalSpent > 0
            ? <p className="text-[10px] text-emerald-500/70 mt-0.5">Saldo positivo</p>
            : <p className="text-[10px] text-red-400 mt-0.5">Orçamento apertado</p>
          }
        </div>
      </div>

      {/* Combined Income vs Expenses Chart */}
      {inputs.salary > 0 && (
        <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Receita vs Gastos</h3>
              <p className="text-xs text-gray-500 mt-0.5">Comparativo mensal</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-500">Economia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-500">Gastos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-gray-500">Renda</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={[{
                  name: currentMonth,
                  Renda: inputs.salary,
                  Economia: summary.totalSaved,
                  Gastos: expenseAnalysis.totalSpent,
                  Disponível: Math.max(0, available - expenseAnalysis.totalSpent),
                }]}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tickFormatter={(val) => formatCurrency(val)} tick={{ fontSize: 10, fill: '#9CA3AF' }} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Renda" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Economia" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Disponível" fill="#6b7280" radius={[4, 4, 0, 0]} barSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl p-4 border border-indigo-500/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Projeção 12 Meses</p>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(summary.projections.months12)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Economizando {formatCurrency(summary.totalSaved)}/mês</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-xl p-4 border border-red-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-red-400" />
            <p className="text-xs font-semibold text-red-300 uppercase tracking-wider">Maior Gasto</p>
          </div>
          <p className="text-lg font-bold text-white">
            {expenseAnalysis.topCategory ? expenseAnalysis.topCategory.label : 'Nenhum'}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {expenseAnalysis.topCategory ? `${formatCurrency(expenseAnalysis.topCategory.total)} · ${expenseAnalysis.topCategory.count}x` : 'Registre gastos para ver'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl p-4 border border-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Meta de Economia</p>
          </div>
          <p className={`text-lg font-bold ${summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {summary.savingsRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {summary.savingsRate >= 20 ? '🎉 Meta atingida!' : `Meta: 20% (faltam ${(20 - summary.savingsRate).toFixed(1)}%)`}
          </p>
        </div>
      </div>
    </div>
  );

  // Income Report
  const renderIncomeReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-xl shadow-indigo-500/20">
          <p className="text-[10px] font-medium text-indigo-200 uppercase tracking-wider">Total Recebido</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(inputs.salary)}</p>
          <p className="text-[10px] text-indigo-200 mt-1">Salário líquido mensal</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-5 text-white shadow-xl shadow-indigo-500/20">
          <p className="text-[10px] font-medium text-indigo-200 uppercase tracking-wider">Ajuda em Casa</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(inputs.helpAtHome)}</p>
          <p className="text-[10px] text-indigo-200 mt-1">{inputs.salary > 0 ? `${(inputs.helpAtHome / inputs.salary * 100).toFixed(1)}% da renda` : '-'}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-5 text-white shadow-xl shadow-emerald-500/20">
          <p className="text-[10px] font-medium text-emerald-200 uppercase tracking-wider">Total Guardado</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(summary.totalSaved)}</p>
          <p className="text-[10px] text-emerald-200 mt-1">{summary.savingsRate.toFixed(1)}% de economia</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-5 text-white shadow-xl shadow-red-500/20">
          <p className="text-[10px] font-medium text-red-200 uppercase tracking-wider">Gastos (mês)</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(expenseAnalysis.totalSpent)}</p>
          <p className="text-[10px] text-red-200 mt-1">{expenseAnalysis.count} registros</p>
        </div>
      </div>

      <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
        <h3 className="text-sm font-semibold text-white mb-4">Detalhamento de Renda</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Descrição</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Valor</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">%</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[
                { name: 'Salário Líquido', value: inputs.salary, color: '#6366f1', pct: 100, tag: 'BASE', tagColor: 'bg-blue-500/10 text-blue-400' },
                { name: 'Ajuda em Casa', value: -inputs.helpAtHome, color: '#818cf8', pct: inputs.salary > 0 ? (inputs.helpAtHome / inputs.salary * 100) : 0, tag: inputs.helpAtHome > 0 ? (inputs.helpAtHome / inputs.salary <= 0.4 ? 'Adequado' : 'Alto') : 'Não definido', tagColor: inputs.helpAtHome > 0 ? (inputs.helpAtHome / inputs.salary <= 0.4 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400') : 'bg-gray-500/10 text-gray-400' },
                { name: 'Guardar (Poupança)', value: -inputs.saveAmount, color: '#10b981', pct: inputs.salary > 0 ? (inputs.saveAmount / inputs.salary * 100) : 0, tag: inputs.saveAmount > 0 ? (inputs.saveAmount / inputs.salary >= 0.2 ? 'Excelente' : 'Abaixo 20%') : 'Não definido', tagColor: inputs.saveAmount > 0 ? (inputs.saveAmount / inputs.salary >= 0.2 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400') : 'bg-gray-500/10 text-gray-400' },
                { name: 'Imprevistos', value: -inputs.emergencyFund, color: '#f59e0b', pct: inputs.salary > 0 ? (inputs.emergencyFund / inputs.salary * 100) : 0, tag: inputs.emergencyFund > 0 ? 'Protegido' : 'Sem reserva', tagColor: inputs.emergencyFund > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400' },
                { name: 'Gastos Diários', value: -expenseAnalysis.totalSpent, color: '#ef4444', pct: inputs.salary > 0 ? (expenseAnalysis.totalSpent / inputs.salary * 100) : 0, tag: expenseAnalysis.totalSpent > 0 ? (expenseAnalysis.totalSpent / inputs.salary <= 0.30 ? 'Controlado' : 'Elevado') : 'Sem gastos', tagColor: expenseAnalysis.totalSpent > 0 ? (expenseAnalysis.totalSpent / inputs.salary <= 0.30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400') : 'bg-gray-500/10 text-gray-400' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${item.value < 0 ? 'text-red-400' : 'text-white'}`}>
                    {item.value < 0 ? `- ${formatCurrency(Math.abs(item.value))}` : formatCurrency(item.value)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-500">{item.pct.toFixed(1)}%</td>
                  <td className="text-right py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.tagColor}`}>{item.tag}</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                    <span className="font-bold text-white">Saldo Final</span>
                  </div>
                </td>
                <td className={`text-right py-3 px-4 font-bold ${Math.max(0, available - expenseAnalysis.totalSpent) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.max(0, available - expenseAnalysis.totalSpent))}
                </td>
                <td className="text-right py-3 px-4 text-gray-500">
                  {inputs.salary > 0 ? `${(Math.max(0, available - expenseAnalysis.totalSpent) / inputs.salary * 100).toFixed(1)}%` : '-'}
                </td>
                <td className="text-right py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${Math.max(0, available - expenseAnalysis.totalSpent) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {Math.max(0, available - expenseAnalysis.totalSpent) > 0 ? '✅ Positivo' : '🔴 Negativo'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Savings Report
  const renderSavingsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-5 text-white shadow-xl shadow-emerald-500/20">
          <p className="text-[10px] font-medium text-emerald-200 uppercase tracking-wider">Economia Mensal</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(summary.totalSaved)}</p>
          <p className="text-[10px] text-emerald-200 mt-1">Guardando por mês</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-xl shadow-blue-500/20">
          <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">Projeção 1 Ano</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(summary.projections.months12)}</p>
          <p className="text-[10px] text-blue-200 mt-1">Se mantiver o ritmo</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-5 text-white shadow-xl shadow-purple-500/20">
          <p className="text-[10px] font-medium text-purple-200 uppercase tracking-wider">Projeção 2 Anos</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(summary.projections.months24)}</p>
          <p className="text-[10px] text-purple-200 mt-1">R$ {((summary.projections.months24) / 24).toFixed(0)}/mês</p>
        </div>
      </div>

      <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
        <h3 className="text-sm font-semibold text-white mb-6">Taxa de Economia</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - Math.min(summary.savingsRate / 100, 1))}`}
                className={summary.savingsRate >= 20 ? 'text-emerald-500' : 'text-amber-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-xl font-bold ${summary.savingsRate >= 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {summary.savingsRate.toFixed(1)}%
                </p>
                <p className="text-[10px] text-gray-500">economia</p>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Meta recomendada</span>
                <span className="text-white font-semibold">20%</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Sua taxa</span>
                <span className={`font-semibold ${summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {summary.savingsRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${summary.savingsRate >= 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(summary.savingsRate, 100)}%` }} />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {summary.savingsRate >= 20
                ? '🎉 Você atingiu a meta de 20%!'
                : `💪 Faltam ${(20 - summary.savingsRate).toFixed(1)}% para a meta`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
        <h3 className="text-sm font-semibold text-white mb-4">Linha do Tempo da Economia</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { mês: 'Agora', acumulado: 0 },
              { mês: '6 Meses', acumulado: summary.projections.months6 },
              { mês: '12 Meses', acumulado: summary.projections.months12 },
              { mês: '24 Meses', acumulado: summary.projections.months24 },
              { mês: '5 Anos', acumulado: summary.totalSaved * 60 },
            ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="mês" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tickFormatter={(val) => val >= 1000 ? `R$${(val / 1000).toFixed(0)}k` : formatCurrency(val)} tick={{ fontSize: 10, fill: '#9CA3AF' }} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="acumulado" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#savingsGradient)" name="Patrimônio" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Expenses Report
  const renderExpensesReport = () => (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
          {(['month', '3months', '6months', 'year', 'all'] as PeriodFilter[]).map((p) => (
            <button key={p} onClick={() => setPeriodFilter(p)}
              className={cn("px-3 py-1.5 text-[11px] font-medium transition-colors",
                periodFilter === p ? "bg-indigo-500/15 text-indigo-300" : "text-gray-500 hover:text-gray-300 bg-transparent"
              )}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-5 text-white shadow-xl shadow-red-500/20">
          <p className="text-[10px] font-medium text-red-200 uppercase tracking-wider">Total Gasto</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(expenseAnalysis.totalSpent)}</p>
          <p className="text-[10px] text-red-200 mt-1">{expenseAnalysis.count} gastos</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-5 text-white shadow-xl shadow-purple-500/20">
          <p className="text-[10px] font-medium text-purple-200 uppercase tracking-wider">Média/Gasto</p>
          <p className="text-xl font-bold mt-2">{formatCurrency(expenseAnalysis.avgPerExpense)}</p>
          <p className="text-[10px] text-purple-200 mt-1">Por transação</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-5 text-white shadow-xl shadow-blue-500/20">
          <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">Maior Categoria</p>
          <p className="text-xl font-bold mt-2 truncate">{expenseAnalysis.topCategory ? expenseAnalysis.topCategory.label : '-'}</p>
          <p className="text-[10px] text-blue-200 mt-1">{expenseAnalysis.topCategory ? `${expenseAnalysis.topCategory.percentage.toFixed(0)}% do total` : ''}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl p-5 text-white shadow-xl shadow-amber-500/20">
          <p className="text-[10px] font-medium text-amber-200 uppercase tracking-wider">% da Renda</p>
          <p className="text-xl font-bold mt-2">{inputs.salary > 0 ? `${((expenseAnalysis.totalSpent / inputs.salary) * 100).toFixed(0)}%` : '-'}</p>
          <p className="text-[10px] text-amber-200 mt-1">Do salário em gastos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
          <h3 className="text-sm font-semibold text-white mb-4">Gastos por Categoria</h3>
          {expenseAnalysis.categoryData.length > 0 ? (
            <div className="space-y-3">
              {expenseAnalysis.categoryData.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-gray-400">{cat.label}</span>
                      <span className="text-[10px] text-gray-600">{cat.count}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{formatCurrency(cat.total)}</span>
                      <span className="text-[10px] text-gray-600 w-8 text-right">{cat.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-600">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Nenhum gasto no período</p>
            </div>
          )}
        </div>

        {/* Daily Chart */}
        <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
          <h3 className="text-sm font-semibold text-white mb-4">Gastos por Dia</h3>
          {expenseAnalysis.dailyChart.length > 0 ? (
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {expenseAnalysis.dailyChart.map((day) => {
                const maxAmount = Math.max(...expenseAnalysis.dailyChart.map(d => d.amount));
                return (
                  <div key={day.date} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 w-14 flex-shrink-0">{day.date}</span>
                    <div className="flex-1 h-4 bg-white/[0.02] rounded overflow-hidden flex items-center">
                      <div className="h-full bg-red-500/40 rounded-r transition-all"
                        style={{ width: `${(day.amount / maxAmount) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-14 text-right font-medium">{formatCurrency(day.amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-600">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Sem dados diários</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Expenses List */}
      <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
        <h3 className="text-sm font-semibold text-white mb-4">Últimos Gastos Registrados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 px-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Descrição</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Categoria</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Data</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {dailyExpenses.slice(0, 20).map((expense) => {
                const catInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category)!;
                return (
                  <tr key={expense.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-sm text-white">{expense.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}>
                        {catInfo.label}
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-3 text-gray-400 text-sm">
                      {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="text-right py-2.5 px-3 font-semibold text-white">{formatCurrency(expense.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Distribution Report
  const renderDistributionReport = () => (
    <div className="space-y-6">
      <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
        <h3 className="text-sm font-semibold text-white mb-4">Distribuição da Renda</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={4} dataKey="value"
                  strokeWidth={2} stroke="#0c0c0d">
                  {distributionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {distributionData.map((item, i) => (
              <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{formatCurrency(item.value)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 w-8 text-right">{item.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-xl p-4 border border-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-300">Prioridade: Guardar</p>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(inputs.saveAmount)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{inputs.salary > 0 ? `${(inputs.saveAmount / inputs.salary * 100).toFixed(1)}% do salário` : 'Defina um valor'}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 rounded-xl p-4 border border-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-amber-300">Proteção: Imprevistos</p>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(inputs.emergencyFund)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{inputs.emergencyFund > 0 ? 'Reserva ativa' : 'Sem reserva'}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl p-4 border border-blue-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <p className="text-xs font-semibold text-blue-300">Livre: Disponível</p>
          </div>
          <p className="text-lg font-bold text-white">{formatCurrency(Math.max(0, available - expenseAnalysis.totalSpent))}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{available - expenseAnalysis.totalSpent > 0 ? 'Pode usar livremente' : 'Tudo comprometido'}</p>
        </div>
      </div>
    </div>
  );

  // History Report
  const renderHistoryReport = () => (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Meses</p>
            <p className="text-lg font-bold text-white">{stats.monthsTracked}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">Acompanhados</p>
          </div>
          <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Média Guardada</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.avgSaved)}</p>
          </div>
          <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Total Acumulado</p>
            <p className="text-lg font-bold text-indigo-400">{formatCurrency(stats.totalSavedAccumulated)}</p>
          </div>
          <div className="bg-[#0c0c0d] rounded-xl p-4 border border-white/[0.04]">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Melhor Mês</p>
            <p className="text-lg font-bold text-emerald-400">{stats.bestMonth.savingsRate.toFixed(1)}%</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{MONTH_NAMES[stats.bestMonth.month - 1]}/{stats.bestMonth.year}</p>
          </div>
        </div>
      )}

      {historyData.length > 0 ? (
        <>
          <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Evolução Mensal</h3>
              <button onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] text-gray-500 hover:text-white transition">
                {showDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showDetails ? 'Simplificar' : 'Detalhar'}
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tickFormatter={(val) => val >= 1000 ? `R$${(val / 1000).toFixed(0)}k` : formatCurrency(val)} tick={{ fontSize: 10, fill: '#9CA3AF' }} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="Salário" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Salário" />
                  {showDetails && (
                    <>
                      <Line type="monotone" dataKey="Ajuda em Casa" stroke="#818cf8" strokeWidth={1.5} dot={{ r: 3 }} name="Ajuda em Casa" />
                      <Line type="monotone" dataKey="Guardar" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} name="Guardar" />
                      <Line type="monotone" dataKey="Imprevistos" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} name="Imprevistos" />
                    </>
                  )}
                  <Line type="monotone" dataKey="Disponível" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Disponível" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-4">Tabela Comparativa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Mês</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Salário</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Guardado</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Disponível</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-[11px] uppercase tracking-wider">Economia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {historyData.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{row.month}</td>
                      <td className="text-right py-3 px-4 text-white">{formatCurrency(row['Salário'])}</td>
                      <td className="text-right py-3 px-4 text-emerald-400 font-semibold">{formatCurrency(row['Total Guardado'])}</td>
                      <td className="text-right py-3 px-4 text-gray-500">{formatCurrency(row['Disponível'])}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          row['Taxa de Economia'] >= 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {row['Taxa de Economia'].toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <Calendar className="w-14 h-14 mb-3 opacity-20" />
          <p className="text-sm font-medium text-gray-500">Nenhum histórico salvo</p>
          <p className="text-xs text-gray-600 mt-1">Use "Salvar Mês" no dashboard para começar</p>
        </div>
      )}
    </div>
  );

  const reports: Record<ReportType, () => React.ReactNode> = {
    overview: renderOverviewReport,
    income: renderIncomeReport,
    savings: renderSavingsReport,
    expenses: renderExpensesReport,
    distribution: renderDistributionReport,
    history: renderHistoryReport,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Relatórios Financeiros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análise completa da sua vida financeira</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-xl text-xs font-medium transition-all border border-white/[0.06]">
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
          <button onClick={() => {
            const dataStr = JSON.stringify({ inputs, history, dailyExpenses, summary, generatedAt: new Date().toISOString() }, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-500/20">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {([
          { id: 'overview' as ReportType, label: 'Visão Geral', icon: <Activity className="w-4 h-4" />, desc: 'Score e resumo' },
          { id: 'income' as ReportType, label: 'Renda', icon: <DollarSign className="w-4 h-4" />, desc: 'Recebimentos' },
          { id: 'savings' as ReportType, label: 'Economia', icon: <Target className="w-4 h-4" />, desc: 'Projeções' },
          { id: 'expenses' as ReportType, label: 'Gastos', icon: <Receipt className="w-4 h-4" />, desc: 'Análise diária' },
          { id: 'distribution' as ReportType, label: 'Distribuição', icon: <PieChartIcon className="w-4 h-4" />, desc: 'Alocação' },
          { id: 'history' as ReportType, label: 'Histórico', icon: <Calendar className="w-4 h-4" />, desc: 'Comparativo' },
        ]).map((report) => (
          <button key={report.id} onClick={() => setActiveReport(report.id)}
            className={`p-4 rounded-xl text-left transition-all border ${
              activeReport === report.id
                ? 'bg-[#0c0c0d] border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                : 'bg-[#0c0c0d]/50 border-white/[0.04] hover:border-white/[0.08]'
            }`}>
            <div className={`p-2 rounded-lg w-fit mb-2 ${
              activeReport === report.id ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/[0.04] text-gray-500'
            }`}>
              {report.icon}
            </div>
            <p className={`text-xs font-semibold ${activeReport === report.id ? 'text-white' : 'text-gray-300'}`}>
              {report.label}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">{report.desc}</p>
          </button>
        ))}
      </div>

      {/* Active Report */}
      <div>
        {reports[activeReport]()}
      </div>

      {/* Summary Footer */}
      {inputs.salary > 0 && (
        <div className="bg-gradient-to-br from-[#0c0c0d] to-gray-900 rounded-xl p-5 border border-white/[0.04]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Resumo Executivo</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Período</p>
              <p className="text-xs font-semibold text-white">{currentMonth} de {currentYear}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Renda Total</p>
              <p className="text-xs font-semibold text-white">{formatCurrency(inputs.salary)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Total Gasto</p>
              <p className="text-xs font-semibold text-white">{formatCurrency(inputs.helpAtHome + inputs.saveAmount + inputs.emergencyFund + expenseAnalysis.totalSpent)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Status</p>
              <p className={`text-xs font-semibold ${healthScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {healthScore >= 70 ? 'Saudável ✅' : 'Em construção ⚠️'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}