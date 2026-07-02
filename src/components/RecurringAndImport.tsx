import { useState, useMemo, useCallback } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../lib/utils';
import { 
  Plus, Trash2, Upload, Check, X, RefreshCw, Calendar,
  Clock, AlertCircle, Download, Edit3, Save, Filter,
  ArrowUpDown, Search, CreditCard, Ban, Receipt,
  Zap, FileText, AlertTriangle, CheckCircle2, RotateCcw,
  ListChecks, PiggyBank, DollarSign, BadgePercent
} from 'lucide-react';

type RecurringFilter = 'all' | 'paid' | 'pending';
type RecurringSort = 'dueDay' | 'value' | 'name';

interface RecurringFormData {
  name: string;
  value: string;
  dueDay: string;
  category: string;
  isEssential: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'moradia', label: 'Moradia', color: 'indigo' },
  { value: 'alimentacao', label: 'Alimentação', color: 'emerald' },
  { value: 'transporte', label: 'Transporte', color: 'amber' },
  { value: 'assinaturas', label: 'Assinaturas', color: 'purple' },
  { value: 'saude', label: 'Saúde', color: 'rose' },
  { value: 'educacao', label: 'Educação', color: 'blue' },
  { value: 'lazer', label: 'Lazer', color: 'pink' },
  { value: 'outros', label: 'Outros', color: 'gray' },
];

const CATEGORY_COLORS: Record<string, string> = {
  moradia: '#6366f1',
  alimentacao: '#10b981',
  transporte: '#f59e0b',
  assinaturas: '#8b5cf6',
  saude: '#f43f5e',
  educacao: '#3b82f6',
  lazer: '#ec4899',
  outros: '#6b7280',
};

const BATCH_AMOUNTS = [50, 100, 200, 500];

export default function RecurringAndImport() {
  const { 
    inputs, recurringExpenses, addRecurringExpense, 
    updateRecurringExpense, removeRecurringExpense,
    toggleRecurringPaid, applyRecurringToCurrentMonth 
  } = useBudgetStore();

  const [filter, setFilter] = useState<RecurringFilter>('all');
  const [sortBy, setSortBy] = useState<RecurringSort>('dueDay');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');

  const [form, setForm] = useState<RecurringFormData>({
    name: '', value: '', dueDay: '5', category: 'outros', isEssential: false
  });

  // Stats
  const stats = useMemo(() => {
    const totalMonthly = recurringExpenses.reduce((acc, r) => acc + r.value, 0);
    const paid = recurringExpenses.filter(r => r.paidThisMonth);
    const pending = recurringExpenses.filter(r => !r.paidThisMonth);
    const totalPaid = paid.reduce((acc, r) => acc + r.value, 0);
    const totalPending = pending.reduce((acc, r) => acc + r.value, 0);
    const essentialCount = recurringExpenses.filter(r => r.category === 'moradia' || r.category === 'alimentacao' || r.category === 'saude').length;
    const percentOfIncome = inputs.salary > 0 ? (totalMonthly / inputs.salary) * 100 : 0;

    return { 
      total: recurringExpenses.length, 
      totalMonthly, 
      paid: paid.length, 
      pending: pending.length,
      totalPaid, 
      totalPending,
      essentialCount,
      percentOfIncome,
    };
  }, [recurringExpenses, inputs.salary]);

  // Filtered & Sorted
  const filteredExpenses = useMemo(() => {
    let result = [...recurringExpenses];
    
    if (filter === 'paid') result = result.filter(r => r.paidThisMonth);
    else if (filter === 'pending') result = result.filter(r => !r.paidThisMonth);

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDay': return a.dueDay - b.dueDay;
        case 'value': return b.value - a.value;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [recurringExpenses, filter, sortBy, search]);

  // Group by due day for calendar view
  const groupedByDay = useMemo(() => {
    const groups: Record<number, typeof recurringExpenses> = {};
    recurringExpenses.forEach(r => {
      if (!groups[r.dueDay]) groups[r.dueDay] = [];
      groups[r.dueDay].push(r);
    });
    return groups;
  }, [recurringExpenses]);

  const handleAdd = () => {
    if (!form.name || !form.value) return;
    addRecurringExpense({ 
      name: form.name, 
      value: parseFloat(form.value) || 0, 
      dueDay: parseInt(form.dueDay) || 1, 
      paidThisMonth: false 
    });
    setForm({ name: '', value: '', dueDay: '5', category: 'outros', isEssential: false });
    setShowForm(false);
  };

  const handleBatchPay = () => {
    applyRecurringToCurrentMonth();
  };

  const handleTogglePaid = useCallback((id: string) => {
    toggleRecurringPaid(id);
  }, [toggleRecurringPaid]);

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && editName.trim()) {
      updateRecurringExpense(id, { name: editName.trim(), value: val });
    }
    setEditingId(null);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n');
      let count = 0;
      lines.forEach(line => {
        const parts = line.split(',');
        const name = parts[0]?.trim();
        const value = parseFloat(parts[1]);
        const day = parseInt(parts[2]) || 1;
        if (name && !isNaN(value)) {
          addRecurringExpense({ name, value, dueDay: day, paidThisMonth: false });
          count++;
        }
      });
      alert(`✅ ${count} despesas importadas com sucesso!`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleCopyTemplate = () => {
    const template = 'Aluguel,1200,5\nInternet,99.90,10\nNetflix,55.90,15\nSpotify,21.90,20\nAcademia,89.90,8';
    navigator.clipboard.writeText(template);
    alert('📋 Template copiado! Cole em um bloco de notas e salve como .csv');
  };

  const getCategoryColor = (cat?: string) => CATEGORY_COLORS[cat || 'outros'] || CATEGORY_COLORS.outros;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automação de Despesas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie despesas fixas e recorrentes de forma inteligente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchPay}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-500/20"
          >
            <Zap className="w-4 h-4" />
            Pagar Todas
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.paid} pagas · {stats.pending} pendentes</p>
        </div>
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total/Mês</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalMonthly)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.percentOfIncome.toFixed(1)}% da renda</p>
        </div>
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Já Pago</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.paid} despesas quitadas</p>
        </div>
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pendente</p>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(stats.totalPending)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.pending} à pagar</p>
        </div>
      </div>

      {/* Progress Bar - % paid */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Progresso do Mês</span>
            </div>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {stats.pending === 0 && stats.total > 0 
              ? '🎉 Todas as despesas pagas este mês!' 
              : `${stats.pending} despesas restantes - ${formatCurrency(stats.totalPending)}`}
          </p>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nova Despesa Recorrente</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Nome</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Ex: Netflix"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Valor (R$)</label>
              <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} 
                placeholder="55.90"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Dia Vencimento</label>
              <input type="number" value={form.dueDay} onChange={e => setForm({...form, dueDay: e.target.value})} 
                min="1" max="31" placeholder="5"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition">
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEssential} onChange={e => setForm({...form, isEssential: e.target.checked})} 
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Despesa essencial</span>
            </label>
            {[50, 100, 200, 500].map(amount => (
              <button
                key={amount}
                onClick={() => setForm({...form, value: String(amount)})}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition border border-gray-200 dark:border-gray-700"
              >
                +{formatCurrency(amount)}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name || !form.value}
            className={`mt-4 w-full py-3 rounded-xl text-sm font-bold transition ${
              form.name && form.value
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" /> Adicionar Despesa Recorrente
          </button>
        </div>
      )}

      {/* Filters & Import */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-3 py-2 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs focus:border-indigo-500 dark:focus:border-indigo-400 outline-none w-40"
            />
          </div>
          {/* Filters */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900/80 rounded-xl p-1 ring-1 ring-gray-100 dark:ring-gray-800/50">
            {(['all', 'pending', 'paid'] as RecurringFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'paid' ? 'Pagas' : 'Pendentes'}
              </button>
            ))}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900/80 rounded-xl p-1 ring-1 ring-gray-100 dark:ring-gray-800/50">
            <span className="px-2 text-xs text-gray-400"><ArrowUpDown className="w-3 h-3" /></span>
            {(['dueDay', 'value', 'name'] as RecurringSort[]).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  sortBy === s
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {s === 'dueDay' ? 'Vencimento' : s === 'value' ? 'Valor' : 'Nome'}
              </button>
            ))}
          </div>
        </div>

        {/* Import Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTemplate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition border border-gray-200 dark:border-gray-700"
          >
            <FileText className="w-3.5 h-3.5" />
            Template
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 cursor-pointer transition border border-indigo-200 dark:border-indigo-800">
            <Upload className="w-3.5 h-3.5" />
            Importar CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
        </div>
      </div>

      {/* Calendar Overview */}
      {Object.keys(groupedByDay).length > 0 && (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Calendário de Vencimentos</h3>
            </div>
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const dayExpenses = groupedByDay[day] || [];
              const totalDay = dayExpenses.reduce((acc, r) => acc + r.value, 0);
              const paidCount = dayExpenses.filter(r => r.paidThisMonth).length;
              const hasExpenses = dayExpenses.length > 0;

              return (
                <div
                  key={day}
                  className={`relative rounded-xl p-2 text-center transition-all duration-200 border ${
                    hasExpenses
                      ? paidCount === dayExpenses.length
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/50'
                  }`}
                >
                  <p className={`text-xs font-bold ${
                    hasExpenses 
                      ? paidCount === dayExpenses.length 
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400'
                  }`}>
                    {day}
                  </p>
                  {hasExpenses && (
                    <div className="mt-1">
                      <p className="text-[10px] font-semibold text-gray-900 dark:text-white">
                        {dayExpenses.length}
                      </p>
                      <p className="text-[8px] text-gray-400 truncate">
                        {formatCurrency(totalDay)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {filter === 'all' ? 'Todas as Despesas' : filter === 'paid' ? 'Despesas Pagas' : 'Despesas Pendentes'}
              <span className="ml-2 text-sm font-normal text-gray-400">({filteredExpenses.length})</span>
            </h3>
          </div>
          <div className="space-y-2">
            {filteredExpenses.map(expense => {
              const isEditing = editingId === expense.id;
              const dueDate = new Date();
              dueDate.setDate(expense.dueDay);
              const isDueSoon = expense.dueDay <= new Date().getDate() + 3 && expense.dueDay >= new Date().getDate() && !expense.paidThisMonth;
              const isOverdue = expense.dueDay < new Date().getDate() && !expense.paidThisMonth;

              return (
                <div
                  key={expense.id}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border ${
                    expense.paidThisMonth
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                      : isOverdue
                        ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                        : isDueSoon
                          ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30'
                          : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleTogglePaid(expense.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        expense.paidThisMonth
                          ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
                      }`}
                    >
                      {expense.paidThisMonth && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </button>

                    {/* Info */}
                    <div>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white w-32 outline-none"
                          />
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white w-20 outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(expense.id)}
                            className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${
                              expense.paidThisMonth 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {expense.name}
                            </span>
                            {isOverdue && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                ATRASADA
                              </span>
                            )}
                            {isDueSoon && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                PRÓXIMO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-gray-400">
                              <Calendar className="w-3 h-3 inline mr-0.5" />
                              Dia {expense.dueDay}
                            </span>
                            <span className={`text-[11px] ${
                              expense.paidThisMonth ? 'text-emerald-500' : isOverdue ? 'text-red-500' : 'text-amber-500'
                            }`}>
                              {expense.paidThisMonth ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${
                      expense.paidThisMonth 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatCurrency(expense.value)}
                    </span>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                        } else {
                          setEditingId(expense.id);
                          setEditName(expense.name);
                          setEditValue(String(expense.value));
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition opacity-0 group-hover:opacity-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remover "${expense.name}"?`)) {
                          removeRecurringExpense(expense.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <Receipt className="w-20 h-20 mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhuma despesa recorrente</p>
          <p className="text-sm mt-1">
            {recurringExpenses.length === 0 
              ? 'Adicione despesas fixas como aluguel, internet, streaming...'
              : 'Nenhuma despesa encontrada com esse filtro'}
          </p>
          {recurringExpenses.length === 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5 text-center">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Adicione Manualmente</h3>
                <p className="text-xs text-gray-500">Cadastre cada despesa com nome, valor e dia de vencimento</p>
              </div>
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5 text-center">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Importe por CSV</h3>
                <p className="text-xs text-gray-500">Use o botão Importar CSV com o formato: Nome,Valor,Dia</p>
              </div>
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5 text-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Use o Template</h3>
                <p className="text-xs text-gray-500">Clique em Template para copiar o formato e criar seu CSV</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Card */}
      {recurringExpenses.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <BadgePercent className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold">Resumo de Despesas Recorrentes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total de Despesas</p>
              <p className="font-semibold">{stats.total} despesas</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Mensal</p>
              <p className="font-semibold text-emerald-400">{formatCurrency(stats.totalMonthly)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">% da Renda</p>
              <p className={`font-semibold ${stats.percentOfIncome <= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.percentOfIncome.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <p className="font-semibold">
                {stats.pending === 0 && stats.total > 0 
                  ? 'Tudo pago ✅' 
                  : `${stats.pending} pendentes`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}