import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../lib/utils';
import { BarChart3 } from 'lucide-react';

export default function TopExpensesList() {
  const { inputs } = useBudgetStore();

  // Mostra a distribuição da renda ordenada
  const allExpenses = [
    { name: 'Ajuda em Casa', value: inputs.helpAtHome },
    { name: 'Guardar (Poupança)', value: inputs.saveAmount },
    { name: 'Imprevistos', value: inputs.emergencyFund },
    { name: 'Disponível', value: Math.max(0, inputs.salary - inputs.helpAtHome - inputs.saveAmount - inputs.emergencyFund) },
  ]
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const maxVal = allExpenses[0]?.value || 1;

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Distribuição da Renda</h3>
      </div>

      <div className="space-y-5">
        {allExpenses.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhum valor registrado.</p>
        ) : (
          allExpenses.map((item, index) => (
            <div key={item.name} className="group">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                  {index + 1}. {item.name}
                </span>
                <span className="font-bold text-white">{formatCurrency(item.value)}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(item.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}