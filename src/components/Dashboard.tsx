import { useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { useBudgetLogic } from '../hooks/useBudgetLogic';
import { formatCurrency, formatCompactCurrency } from '../lib/utils';
import {
  Wallet,
  PiggyBank,
  House,
  ShieldAlert,
  Banknote,
  TrendingDown,
  Activity,
  TrendingUp,
  Target,
  Receipt,
  Sparkles,
  Calendar,
} from 'lucide-react';
import DailyExpenseTracker from './DailyExpenseTracker';

export default function Dashboard() {
  const { inputs } = useBudgetStore();
  const { summary } = useBudgetLogic(inputs);
  const dailyExpenses = useBudgetStore((s) => s.dailyExpenses);

  const hasData = inputs.salary > 0;
  const currentMonthExpenses = dailyExpenses.filter(e => {
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return e.date.startsWith(`${year}-${monthStr}`);
  });

  const available = Math.max(0, inputs.salary - inputs.helpAtHome - inputs.saveAmount - inputs.emergencyFund - summary.dailyExpensesTotal);
  const totalCommitted = inputs.helpAtHome + inputs.saveAmount + inputs.emergencyFund + summary.dailyExpensesTotal;
  const committedPercentage = inputs.salary > 0 ? (totalCommitted / inputs.salary) * 100 : 0;
  const dailyExpenseRatio = inputs.salary > 0 ? (summary.dailyExpensesTotal / inputs.salary) * 100 : 0;

  // Health Score computation
  const healthScore = useMemo(() => {
    if (inputs.salary === 0) return 0;
    let score = 0;
    if (summary.savingsRate >= 20) score += 30;
    else if (summary.savingsRate >= 10) score += 15;
    if (inputs.emergencyFund > 0) score += 20;
    if (inputs.helpAtHome > 0) score += 10;
    if (dailyExpenseRatio <= 0.30) score += 30;
    else if (dailyExpenseRatio <= 0.50) score += 15;
    return Math.min(100, score);
  }, [inputs, summary, dailyExpenseRatio]);

  const getHealthStatus = (score: number) => {
    if (score >= 70) return { label: 'Saudável', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (score >= 40) return { label: 'Atenção', color: 'text-amber-400', bg: 'bg-amber-500' };
    return { label: 'Crítico', color: 'text-red-400', bg: 'bg-red-500' };
  };

  const health = getHealthStatus(healthScore);

  const metrics = [
    {
      label: 'Recebido',
      value: summary.totalReceived,
      percentage: '100%',
      icon: Banknote,
      color: 'bg-blue-500/10 text-blue-400',
      gradient: 'from-blue-600 to-blue-700',
    },
    {
      label: 'Ajuda em Casa',
      value: summary.helpAtHome,
      percentage: inputs.salary > 0 ? `${((inputs.helpAtHome / inputs.salary) * 100).toFixed(0)}%` : '0%',
      icon: House,
      color: 'bg-indigo-500/10 text-indigo-400',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      label: 'Poupança',
      value: summary.saveAmount,
      percentage: inputs.salary > 0 ? `${((inputs.saveAmount / inputs.salary) * 100).toFixed(0)}%` : '0%',
      icon: PiggyBank,
      color: 'bg-emerald-500/10 text-emerald-400',
      gradient: 'from-emerald-600 to-teal-600',
    },
    {
      label: 'Imprevistos',
      value: summary.emergencyFund,
      percentage: inputs.salary > 0 ? `${((inputs.emergencyFund / inputs.salary) * 100).toFixed(0)}%` : '0%',
      icon: ShieldAlert,
      color: 'bg-amber-500/10 text-amber-400',
      gradient: 'from-amber-600 to-orange-600',
    },
    {
      label: 'Gastos Diários',
      value: summary.dailyExpensesTotal,
      percentage: dailyExpenseRatio > 0 ? `${dailyExpenseRatio.toFixed(0)}%` : '0%',
      icon: TrendingDown,
      color: 'bg-red-500/10 text-red-400',
      isExpense: true,
      gradient: 'from-red-600 to-rose-600',
    },
    {
      label: 'Disponível',
      value: available,
      percentage: inputs.salary > 0 ? `${((available / inputs.salary) * 100).toFixed(0)}%` : '0%',
      icon: Wallet,
      color: 'bg-gray-500/10 text-gray-400',
      gradient: 'from-gray-600 to-gray-700',
    },
  ];

  const projections = [
    { label: '6 Meses', value: summary.projections.months6, color: 'text-indigo-400', gradient: 'from-indigo-500/10 to-purple-500/5' },
    { label: '12 Meses', value: summary.projections.months12, color: 'text-purple-400', gradient: 'from-purple-500/10 to-pink-500/5' },
    { label: '24 Meses', value: summary.projections.months24, color: 'text-emerald-400', gradient: 'from-emerald-500/10 to-teal-500/5' },
  ];

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Wallet className="w-7 h-7 opacity-30" />
        </div>
        <p className="text-base font-medium text-gray-500">Preencha seus dados financeiros</p>
        <p className="text-sm text-gray-600 mt-1">Informe seu salário e distribuição para ver o dashboard completo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard Financeiro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumo mensal completo com gastos diários</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0c0c0d] rounded-xl border border-white/[0.04]">
            <div className="relative w-8 h-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - healthScore / 100)}`}
                  className={health.color} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[9px] font-bold ${health.color}`}>{healthScore}</span>
              </div>
            </div>
            <div>
              <p className={`text-[11px] font-semibold ${health.color}`}>{health.label}</p>
              <p className="text-[9px] text-gray-600">Saúde</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500">Mês atual</p>
            <p className="text-xs text-white font-medium">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid - 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-[#0c0c0d] rounded-xl p-3.5 border border-white/[0.04] hover:border-white/[0.08] transition-all group cursor-default"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${metric.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-gray-600">{metric.percentage}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                {metric.label}
              </p>
              <p className="text-sm font-bold text-white">
                {'isExpense' in metric && metric.isExpense ? formatCurrency(metric.value) : formatCurrency(metric.value)}
              </p>
              {(metric as any).count !== undefined && (metric as any).count > 0 && (
                <p className="text-[9px] text-gray-600 mt-0.5">{(metric as any).count} registros</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Expense Tracker inline */}
      <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
        <DailyExpenseTracker />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Projections + Indicators */}
        <div className="lg:col-span-2 space-y-4">
          {/* Projections */}
          <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white">Projeção de Economia</h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Patrimônio acumulado ao longo do tempo</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600">Economia mensal</p>
                <p className="text-sm font-bold text-white">{formatCompactCurrency(summary.totalSaved)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {projections.map((p) => (
                <div
                  key={p.label}
                  className={`p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] ${p.gradient}`}
                >
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1.5">
                    {p.label}
                  </p>
                  <p className={`text-base font-bold ${p.color}`}>
                    {formatCompactCurrency(p.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.03]">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Taxa de economia</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        summary.savingsRate >= 20 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(summary.savingsRate, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${
                    summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {summary.savingsRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                summary.savingsRate >= 20
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                Meta: 20%
              </span>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl p-4 border border-indigo-500/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">12 Meses</p>
              </div>
              <p className="text-base font-bold text-white">{formatCompactCurrency(summary.projections.months12)}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(summary.totalSaved)}/mês</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-xl p-4 border border-red-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-3.5 h-3.5 text-red-400" />
                <p className="text-[10px] font-semibold text-red-300 uppercase tracking-wider">Gastos mês</p>
              </div>
              <p className="text-base font-bold text-white">{formatCurrency(summary.dailyExpensesTotal)}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{currentMonthExpenses.length} registros</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl p-4 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Disponível</p>
              </div>
              <p className="text-base font-bold text-white">{formatCurrency(available)}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {available > 0 ? 'Livre para gastar' : 'Renda comprometida'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Indicators Panel */}
        <div className="space-y-3">
          {/* Health Score Card */}
          <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Indicadores</h2>
            </div>
            
            <div className="space-y-4">
              {/* Savings Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Taxa de Economia</span>
                  <span className={`text-xs font-semibold ${
                    summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {summary.savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      summary.savingsRate >= 20 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(summary.savingsRate, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Meta: 20%</p>
              </div>

              {/* Committed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Renda Comprometida</span>
                  <span className={`text-xs font-semibold ${
                    committedPercentage < 80 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {committedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(committedPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Ideal: {'<'} 80%</p>
              </div>

              {/* Daily Expenses */}
              {summary.dailyExpensesTotal > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Gastos Diários</span>
                    <span className={`text-xs font-semibold ${
                      dailyExpenseRatio <= 30 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {dailyExpenseRatio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(dailyExpenseRatio, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">Ideal: {'<'} 30%</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Balance */}
          <div className="bg-[#0c0c0d] rounded-xl p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Saldo Disponível</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCompactCurrency(available)}
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              {available > 0 ? 'Livre após destinações e gastos' : 'Renda completamente gasta'}
            </p>
            
            {/* Breakdown */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Salário</span>
                <span className="text-white font-medium">+ {formatCurrency(inputs.salary)}</span>
              </div>
              {summary.helpAtHome > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Ajuda em Casa</span>
                  <span className="text-indigo-400 font-medium">- {formatCurrency(summary.helpAtHome)}</span>
                </div>
              )}
              {summary.saveAmount > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Poupança</span>
                  <span className="text-emerald-400 font-medium">- {formatCurrency(summary.saveAmount)}</span>
                </div>
              )}
              {summary.emergencyFund > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Imprevistos</span>
                  <span className="text-amber-400 font-medium">- {formatCurrency(summary.emergencyFund)}</span>
                </div>
              )}
              {summary.dailyExpensesTotal > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Gastos Diários</span>
                  <span className="text-red-400 font-medium">- {formatCurrency(summary.dailyExpensesTotal)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}