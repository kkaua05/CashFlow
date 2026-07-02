import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../lib/utils';

export default function HistoryChart() {
  const { history } = useBudgetStore();

  // Ordena do mais antigo para o mais novo para o gráfico
  const sortedHistory = [...history].reverse();

  const chartData = sortedHistory.map((snap) => ({
    name: `${snap.month}/${snap.year}`,
    guardado: snap.totalSaved,
    saldo: snap.remaining,
    salario: snap.salary,
  }));

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Evolução Financeira</h3>
        {chartData.length < 2 && (
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            Salve 2+ meses para ver o gráfico
          </span>
        )}
      </div>
      
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGuardado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDisponivel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                formatter={(value: unknown) => {
                  const numValue = typeof value === 'number' ? value : Number(value);
                  return [formatCurrency(numValue), ''];
                }}
              />
              <Area type="monotone" dataKey="guardado" stroke="#6366f1" fillOpacity={1} fill="url(#colorGuardado)" strokeWidth={2} name="Guardado" />
              <Area type="monotone" dataKey="saldo" stroke="#10b981" fillOpacity={1} fill="url(#colorDisponivel)" strokeWidth={2} name="Disponível" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">Nenhum dado histórico salvo.</p>
            <p className="text-xs mt-1">Clique em "Salvar Mês" no dashboard para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}