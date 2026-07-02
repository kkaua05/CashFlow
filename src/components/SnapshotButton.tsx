import { useBudgetStore } from '../store/budgetStore';
import { Save } from 'lucide-react';

export default function SnapshotButton() {
  const { inputs, saveSnapshot } = useBudgetStore();
  
  const totalCommitted = inputs.helpAtHome + inputs.saveAmount + inputs.emergencyFund;
  const isDisabled = inputs.salary === 0 && totalCommitted === 0;

  const handleSave = () => {
    if (window.confirm('Deseja salvar o estado atual como o fechamento deste mês?')) {
      saveSnapshot();
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isDisabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
        isDisabled 
          ? 'bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
      }`}
    >
      <Save className="w-4 h-4" />
      <span>Salvar Mês Atual</span>
    </button>
  );
}