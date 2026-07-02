import { useMemo, useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../lib/utils';
import { CalendarDays, TrendingUp } from 'lucide-react';

export default function FinancialHeatmap() {
  const { inputs } = useBudgetStore();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const heatmapData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo

    const totalCommitted = inputs.helpAtHome + inputs.saveAmount + inputs.emergencyFund;
    const dailyAvg = daysInMonth > 0 ? totalCommitted / daysInMonth : 0;
    const dailySalary = daysInMonth > 0 ? inputs.salary / daysInMonth : 0;

    const days = [];
    // Preencher dias vazios do início do mês
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, intensity: 0 });
    }

    // Preencher dias reais
    for (let d = 1; d <= daysInMonth; d++) {
      // Simulação determinística baseada no dia do mês (sem Math.random)
      // Isso cria uma variação previsível para demonstração
      const variationPattern = Math.sin(d * 0.5) * 0.2; // Variação entre -0.2 e +0.2
      const randomFactor = 0.9 + variationPattern; 
      const dailySpend = dailyAvg * randomFactor;
      
      let intensity = 0; // 0: Sem dados, 1: Baixo, 2: Médio, 3: Alto
      let colorClass = '';
      let status = '';

      if (totalCommitted === 0) {
        colorClass = 'bg-gray-800 border-gray-700';
        status = 'Sem gastos';
      } else {
        const ratio = dailySpend / dailySalary; // Quanto do salário diário foi gasto
        
        if (ratio < 0.1) {
          intensity = 1;
          colorClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
          status = 'Seguro';
        } else if (ratio < 0.3) {
          intensity = 2;
          colorClass = 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
          status = 'Atenção';
        } else {
          intensity = 3;
          colorClass = 'bg-red-500/20 border-red-500/50 text-red-400';
          status = 'Crítico';
        }
      }

      days.push({ 
        day: d, 
        intensity, 
        spend: dailySpend, 
        colorClass, 
        status 
      });
    }

    return { days, dailyAvg, totalExpenses: totalCommitted };
  }, [inputs, currentMonth, currentYear]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Calendário Financeiro</h3>
            <p className="text-xs text-gray-500">Mapa de calor de gastos mensais</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Média Diária</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(heatmapData.dailyAvg)}</p>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500"></span> 
          Seguro
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-yellow-500/40 border border-yellow-500"></span> 
          Atenção
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500"></span> 
          Crítico
        </span>
      </div>

      {/* Grid do Calendário */}
      <div className="relative">
        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 gap-2">
          {heatmapData.days.map((d, index) => {
            if (!d.day) return <div key={`empty-${index}`} className="aspect-square" />;
            
            const isHovered = hoveredDay === d.day;
            
            return (
              <div
                key={d.day}
                onMouseEnter={() => setHoveredDay(d.day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`
                  group relative aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                  ${d.colorClass} 
                  ${isHovered ? 'scale-110 shadow-lg z-10 bg-gray-800' : 'hover:border-gray-500'}
                `}
              >
                <span className={`text-sm font-bold ${isHovered ? 'text-white' : ''}`}>
                  {d.day}
                </span>
                
                {/* Tooltip Flutuante */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-50 pointer-events-none">
                    <p className="text-xs font-bold text-white text-center mb-1">{d.day} do Mês</p>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-400">Gasto Est.</span>
                      <span className="text-white">{formatCurrency(d.spend)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1 pt-1 border-t border-gray-700">
                      <span className={`w-2 h-2 rounded-full ${
                        d.status === 'Seguro' ? 'bg-emerald-500' : d.status === 'Atenção' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-gray-300">{d.status}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo Inferior */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4" />
              <span>Total Comprometido:</span>
        </div>
        <span className={`text-lg font-bold ${heatmapData.totalExpenses > inputs.salary ? 'text-red-500' : 'text-emerald-500'}`}>
          {formatCurrency(heatmapData.totalExpenses)}
        </span>
      </div>
    </div>
  );
}