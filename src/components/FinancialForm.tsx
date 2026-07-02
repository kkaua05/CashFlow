import { useBudgetStore } from '../store/budgetStore';
import { cn } from '../lib/utils';
import { DollarSign, House, PiggyBank, ShieldAlert } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  description?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label, value, onChange, className, placeholder, icon, description
}) => (
  <div className="group">
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
    </div>
    {description && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 ml-1">{description}</p>
    )}
    <div className="relative">
      <input
        type="number"
        min="0"
        step="0.01"
        value={value || ''}
        placeholder={placeholder || '0,00'}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
          "bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white",
          "border-gray-100 dark:border-gray-700",
          "focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400",
          "focus:shadow-lg focus:shadow-indigo-500/10",
          "hover:border-gray-200 dark:hover:border-gray-600",
          "placeholder:text-gray-300 dark:placeholder:text-gray-600",
          className
        )}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
        R$
      </span>
    </div>
  </div>
);

export default function FinancialForm() {
  const { inputs, setInputs } = useBudgetStore();

  const updateField = (field: keyof typeof inputs, value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
    setInputs({ [field]: numValue });
  };

  return (
    <div className="bg-white dark:bg-gray-900/80 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/50 p-6 space-y-6 backdrop-blur-xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Controle Financeiro</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie sua renda mensal de forma simples</p>
      </div>

      {/* Salário - Input Principal */}
      <div className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/30">
        <InputField 
          label="Quanto você recebe (Salário Líquido)" 
          value={inputs.salary} 
          onChange={(value: string) => updateField('salary', value)} 
          className="bg-white dark:bg-gray-900 text-base font-semibold border-indigo-200 dark:border-indigo-700"
          placeholder="0,00"
          icon={<DollarSign className="w-4 h-4" />}
          description="Seu salário líquido mensal ou renda total"
        />
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
          Distribuição da Renda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/20">
            <InputField 
              label="Ajudar em Casa" 
              value={inputs.helpAtHome} 
              onChange={(v) => updateField('helpAtHome', v)} 
              icon={<House className="w-4 h-4" />}
              description="Contribuição mensal com os colegas"
              placeholder="0,00"
            />
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/20">
            <InputField 
              label="Guardar (Poupança)" 
              value={inputs.saveAmount} 
              onChange={(v) => updateField('saveAmount', v)} 
              icon={<PiggyBank className="w-4 h-4" />}
              description="Valor para investir e construir patrimônio"
              placeholder="0,00"
            />
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/20">
            <InputField 
              label="Imprevistos" 
              value={inputs.emergencyFund} 
              onChange={(v) => updateField('emergencyFund', v)} 
              icon={<ShieldAlert className="w-4 h-4" />}
              description="Reserva para emergências"
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      {/* Resumo rápido */}
      {inputs.salary > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recebido</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inputs.salary)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ajuda em Casa</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inputs.helpAtHome)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Guardado</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inputs.saveAmount + inputs.emergencyFund)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Disponível</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  inputs.salary - inputs.helpAtHome - inputs.saveAmount - inputs.emergencyFund
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}