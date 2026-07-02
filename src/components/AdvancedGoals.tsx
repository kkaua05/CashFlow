import { useState, useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { useBudgetLogic } from '../hooks/useBudgetLogic';
import { formatCurrency } from '../lib/utils';
import { 
  Plus, Trash2, Target, Calendar, TrendingUp, Clock, 
  AlertCircle, CheckCircle2, Medal, Sparkles,
  ArrowUpDown, Edit3, Save, X, PiggyBank,
  Rocket, Flag, BarChart3, Zap, Award, ShieldAlert
} from 'lucide-react';

type GoalFilter = 'all' | 'active' | 'completed' | 'emergency';
type SortBy = 'deadline' | 'progress' | 'priority' | 'name';

interface GoalFormData {
  name: string;
  target: string;
  current: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  category: 'short' | 'medium' | 'long';
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' },
  medium: { label: 'Média', color: 'text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
  high: { label: 'Alta', color: 'text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700' },
  emergency: { label: 'Emergência', color: 'text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700' },
};

const CATEGORY_CONFIG = {
  short: { label: 'Curto Prazo', icon: Clock, color: 'text-emerald-400', maxMonths: 6 },
  medium: { label: 'Médio Prazo', icon: Calendar, color: 'text-blue-400', maxMonths: 24 },
  long: { label: 'Longo Prazo', icon: Rocket, color: 'text-purple-400', maxMonths: Infinity },
};

const SUGGESTED_GOALS = [
  { name: 'Reserva de Emergência', icon: ShieldAlert, color: 'amber', targetMonths: 6, category: 'long' as const },
  { name: 'Fundo de Investimento', icon: TrendingUp, color: 'emerald', targetMonths: 12, category: 'long' as const },
  { name: 'Viagem dos Sonhos', icon: Rocket, color: 'purple', targetMonths: 12, category: 'medium' as const },
  { name: 'Curso / Faculdade', icon: Award, color: 'blue', targetMonths: 24, category: 'medium' as const },
  { name: 'Entrada Casa Própria', icon: Flag, color: 'indigo', targetMonths: 60, category: 'long' as const },
  { name: 'Novo Celular / Notebook', icon: Zap, color: 'rose', targetMonths: 6, category: 'short' as const },
];

export default function AdvancedGoals() {
  const { inputs } = useBudgetStore();
  const { summary } = useBudgetLogic(inputs);
  const { goals, addGoal, updateGoalProgress, removeGoal } = useBudgetStore();

  const [filter, setFilter] = useState<GoalFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('deadline');
  const [showForm, setShowForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState('');

  const [form, setForm] = useState<GoalFormData>({
    name: '', target: '', current: '0', deadline: '', priority: 'medium', category: 'short'
  });

  const stats = useMemo(() => {
    const active = goals.filter(g => g.current < g.target);
    const completed = goals.filter(g => g.current >= g.target);
    const emergency = goals.filter(g => g.priority === 'emergency');
    const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
    const totalCurrent = goals.reduce((acc, g) => acc + g.current, 0);
    const totalRemaining = totalTarget - totalCurrent;
    const monthlyNeeded = active.length > 0 
      ? active.reduce((acc, g) => {
          if (!g.deadline) return acc;
          const monthsLeft = Math.max(1, (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
          return acc + (g.target - g.current) / monthsLeft;
        }, 0)
      : 0;
    return { active: active.length, completed: completed.length, emergency: emergency.length, totalTarget, totalCurrent, totalRemaining, monthlyNeeded };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    let result = [...goals];
    if (filter === 'active') result = result.filter(g => g.current < g.target);
    else if (filter === 'completed') result = result.filter(g => g.current >= g.target);
    else if (filter === 'emergency') result = result.filter(g => g.priority === 'emergency');
    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          const pA = a.target > 0 ? a.current / a.target : 0;
          const pB = b.target > 0 ? b.current / b.target : 0;
          return pA - pB;
        case 'priority':
          const order = { emergency: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        case 'name':
          return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return result;
  }, [goals, filter, sortBy]);

  const getGoalStatus = (goal: typeof goals[0]) => {
    if (!goal.deadline) return { daysLeft: Infinity, message: 'Sem prazo', color: 'text-gray-400', monthsLeft: 0, requiredPerMonth: 0, isOverdue: false };
    const now = new Date();
    const end = new Date(goal.deadline);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const monthsLeft = Math.max(0, diffDays / 30);
    const requiredPerMonth = monthsLeft > 0 ? (goal.target - goal.current) / monthsLeft : 0;
    if (diffDays < 0 && goal.current < goal.target) {
      return { daysLeft: diffDays, message: `Atrasado ${Math.abs(diffDays)}d`, color: 'text-red-500', monthsLeft: 0, requiredPerMonth, isOverdue: true };
    }
    if (goal.current >= goal.target) {
      return { daysLeft: diffDays, message: 'Concluída 🎉', color: 'text-emerald-500', monthsLeft: 0, requiredPerMonth: 0, isOverdue: false };
    }
    return { daysLeft: diffDays, message: `${Math.round(monthsLeft)} meses`, color: 'text-blue-400', monthsLeft, requiredPerMonth, isOverdue: false };
  };

  const getCategoryFromDeadline = (deadline?: string): keyof typeof CATEGORY_CONFIG => {
    if (!deadline) return 'long';
    const months = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (months <= 6) return 'short';
    if (months <= 24) return 'medium';
    return 'long';
  };

  const handleAddGoal = () => {
    if (!form.name || !form.target) return;
    addGoal({
      name: form.name,
      target: parseFloat(form.target) || 0,
      current: parseFloat(form.current) || 0,
      deadline: form.deadline || undefined,
      priority: form.priority,
    });
    setForm({ name: '', target: '', current: '0', deadline: '', priority: 'medium', category: 'short' });
    setShowForm(false);
  };

  const handleSuggestedGoal = (suggestion: typeof SUGGESTED_GOALS[0]) => {
    const suggestedTarget = inputs.salary * suggestion.targetMonths;
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + suggestion.targetMonths);
    addGoal({
      name: suggestion.name,
      target: suggestedTarget,
      current: 0,
      deadline: deadline.toISOString().split('T')[0],
      priority: 'medium',
    });
    setShowSuggestions(false);
  };

  const handleQuickProgress = (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    updateGoalProgress(id, goal.current + amount);
  };

  const CategoryIcon = ({ icon: Icon, className }: { icon: React.ComponentType<{ className?: string }>; className?: string }) => <Icon className={className || 'w-3 h-3'} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metas Financeiras</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Defina, acompanhe e conquiste seus objetivos financeiros</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowSuggestions(!showSuggestions); setShowForm(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition border border-gray-200 dark:border-gray-700"
          ><Sparkles className="w-4 h-4" /> Sugestões</button>
          <button onClick={() => { setShowForm(!showForm); setShowSuggestions(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-500/20"
          ><Plus className="w-4 h-4" /> Nova Meta</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Total de Metas', value: goals.length, sub: `${stats.active} ativas · ${stats.completed} concluídas`, color: 'indigo' },
          { icon: PiggyBank, label: 'Total Acumulado', value: formatCurrency(stats.totalCurrent), sub: `de ${formatCurrency(stats.totalTarget)}`, color: 'emerald' },
          { icon: Clock, label: 'Falta Acumular', value: formatCurrency(stats.totalRemaining), sub: 'Restante para todas as metas', color: 'amber' },
          { icon: TrendingUp, label: 'Necessário/mês', value: formatCurrency(stats.monthlyNeeded), sub: summary.totalSaved >= stats.monthlyNeeded ? '✅ Dentro do orçamento' : `⚠️ Faltam ${formatCurrency(stats.monthlyNeeded - summary.totalSaved)}/mês`, color: 'purple' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 bg-${card.color}-100 dark:bg-${card.color}-900/30 rounded-lg`}>
                <card.icon className={`w-4 h-4 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {showSuggestions && (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Metas Sugeridas</h3>
            </div>
            <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Baseado no seu salário de {formatCurrency(inputs.salary)}, sugerimos:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUGGESTED_GOALS.map((sg, i) => {
              const value = inputs.salary * sg.targetMonths;
              const colorMap: Record<string, string> = { amber: 'amber', emerald: 'emerald', purple: 'purple', blue: 'blue', indigo: 'indigo', rose: 'rose' };
              const c = colorMap[sg.color] || 'indigo';
              return (
                <button key={i} onClick={() => handleSuggestedGoal(sg)}
                  className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-gray-50 dark:bg-gray-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg bg-${c}-100 dark:bg-${c}-900/30 text-${c}-600 dark:text-${c}-400`}>
                      <sg.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{sg.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">Valor sugerido: {formatCurrency(value)}</p>
                  <p className="text-xs text-gray-400">Prazo: {sg.targetMonths} meses · {CATEGORY_CONFIG[sg.category].label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nova Meta</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Nome da Meta', placeholder: 'Ex: Reserva de Emergência', val: form.name, set: (v: string) => setForm({...form, name: v}), type: 'text' },
              { label: 'Valor Alvo (R$)', placeholder: '10000', val: form.target, set: (v: string) => setForm({...form, target: v}), type: 'number' },
              { label: 'Já guardado (opcional)', placeholder: '0', val: form.current, set: (v: string) => setForm({...form, current: v}), type: 'number' },
            ].map((f, i) => (
              <div key={i}>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Data Limite</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value, category: getCategoryFromDeadline(e.target.value)})}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition scheme-dark" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Prioridade</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as 'low' | 'medium' | 'high' | 'emergency'})}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition">
                <option value="low">Baixa Prioridade</option>
                <option value="medium">Média Prioridade</option>
                <option value="high">Alta Prioridade</option>
                <option value="emergency">🚨 Emergência</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
              <div className="flex items-center gap-2 h-full pt-1">
                {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map(key => {
                  const CatIcon = CATEGORY_CONFIG[key].icon;
                  return (
                    <button key={key} onClick={() => {
                      const months = key === 'short' ? 6 : key === 'medium' ? 24 : 60;
                      const d = new Date(); d.setMonth(d.getMonth() + months);
                      setForm({...form, category: key, deadline: d.toISOString().split('T')[0]});
                    }} className={`px-3 py-2 rounded-lg text-xs font-medium transition border ${
                      form.category === key ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      <CatIcon className="w-3 h-3 inline mr-1" /> {CATEGORY_CONFIG[key].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button onClick={handleAddGoal} disabled={!form.name || !form.target}
            className={`mt-6 w-full py-3 rounded-xl text-sm font-bold transition ${form.name && form.target ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
          ><Plus className="w-4 h-4 inline mr-2" /> Criar Meta</button>
        </div>
      )}

      {goals.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900/80 rounded-xl p-1 ring-1 ring-gray-100 dark:ring-gray-800/50">
            {(['all', 'active', 'completed', 'emergency'] as GoalFilter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >{f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : f === 'completed' ? 'Concluídas' : '🚨 Emergência'}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900/80 rounded-xl p-1 ring-1 ring-gray-100 dark:ring-gray-800/50">
            <span className="px-2 text-xs text-gray-400"><ArrowUpDown className="w-3 h-3" /></span>
            {(['deadline', 'priority', 'progress', 'name'] as SortBy[]).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${sortBy === s ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >{s === 'deadline' ? 'Prazo' : s === 'priority' ? 'Prioridade' : s === 'progress' ? 'Progresso' : 'Nome'}</button>
            ))}
          </div>
        </div>
      )}

      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map(goal => {
            const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
            const status = getGoalStatus(goal);
            const priorityConfig = PRIORITY_CONFIG[goal.priority];
            const category = getCategoryFromDeadline(goal.deadline);
            const catConfig = CATEGORY_CONFIG[category];
            const isCompleted = goal.current >= goal.target;
            const isEditing = editingId === goal.id;
            const CatIcon = catConfig.icon;

            return (
              <div key={goal.id} className={`relative bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6 transition-all duration-200 hover:shadow-md ${goal.priority === 'emergency' && !isCompleted ? 'ring-2 ring-red-500/30 dark:ring-red-500/20' : ''}`}>
                <div className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityConfig.bg} ${priorityConfig.color}`}>
                  {PRIORITY_CONFIG[goal.priority].label}
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : goal.priority === 'emergency' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{goal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${catConfig.color}`}><CatIcon className="w-3 h-3 inline mr-0.5" />{catConfig.label}</span>
                      <span className="text-gray-400">·</span>
                      <span className={`text-xs font-semibold ${status.color}`}>{status.message}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-emerald-500' : goal.priority === 'emergency' ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Acumulado</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(goal.current)}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-500 dark:text-gray-400">Meta</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(goal.target)}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-500 dark:text-gray-400">Progresso</p><p className={`text-lg font-bold ${isCompleted ? 'text-emerald-500' : 'text-indigo-500'}`}>{progress.toFixed(0)}%</p></div>
                </div>
                {status.requiredPerMonth > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><PiggyBank className="w-4 h-4 text-indigo-400" /><span className="text-xs text-gray-500 dark:text-gray-400">Guardar por mês</span></div>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(status.requiredPerMonth)}</span>
                    </div>
                    {summary.totalSaved > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${summary.totalSaved >= status.requiredPerMonth ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min((summary.totalSaved / status.requiredPerMonth) * 100, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">{summary.totalSaved >= status.requiredPerMonth ? '✅' : `${(summary.totalSaved / status.requiredPerMonth * 100).toFixed(0)}%`}</span>
                      </div>
                    )}
                  </div>
                )}
                {!isCompleted && (
                  <div className="flex gap-2 mb-4">
                    {[100, 500, 1000].map(amount => (
                      <button key={amount} onClick={() => handleQuickProgress(goal.id, amount)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition"
                      >+{formatCurrency(amount)}</button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input type="number" value={editProgress} onChange={e => setEditProgress(e.target.value)}
                        className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 outline-none" placeholder="Valor" />
                      <button onClick={() => { const val = parseFloat(editProgress); if (!isNaN(val)) updateGoalProgress(goal.id, val); setEditingId(null); }}
                        className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input type="range" min="0" max={goal.target} step={10} value={goal.current}
                        onChange={e => updateGoalProgress(goal.id, parseFloat(e.target.value))}
                        className="flex-1 accent-indigo-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                      <button onClick={() => { setEditingId(goal.id); setEditProgress(String(goal.current)); }}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><Edit3 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <button onClick={() => removeGoal(goal.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
                {goal.deadline && !isCompleted && (
                  <div className={`mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between ${status.isOverdue ? 'bg-red-50 dark:bg-red-900/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-3.5 h-3.5 ${status.isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${status.isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                        {status.isOverdue ? 'META ATRASADA' : `Prazo: ${new Date(goal.deadline).toLocaleDateString('pt-BR')}`}
                      </span>
                    </div>
                    {status.isOverdue && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-semibold"><AlertCircle className="w-3 h-3" />{Math.abs(status.daysLeft)} dias</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <Target className="w-20 h-20 mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhuma meta {filter !== 'all' ? 'encontrada' : 'criada'}</p>
          <p className="text-sm mt-1">{goals.length === 0 ? 'Crie sua primeira meta financeira ou use as sugestões inteligentes' : 'Tente alterar o filtro para ver outras metas'}</p>
          {goals.length === 0 && (
            <button onClick={() => setShowSuggestions(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" /> Ver Sugestões
            </button>
          )}
        </div>
      )}

      {goals.length === 0 && !showForm && !showSuggestions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Target, title: 'Defina Metas', desc: 'Crie metas financeiras com prazo e valor definido' },
            { icon: BarChart3, title: 'Acompanhe o Progresso', desc: 'Use o slider ou os botões rápidos para atualizar' },
            { icon: Medal, title: 'Conquiste', desc: 'Acompanhe suas metas até a conclusão' },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}