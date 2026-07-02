import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatCompactCurrency = (value: number): string => {
  const abs = Math.abs(value);
  
  if (abs >= 1_000_000) {
    const formatted = (value / 1_000_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 1,
    });
    return `R$ ${formatted} mi`;
  }
  
  if (abs >= 1_000) {
    const formatted = (value / 1_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 1,
    });
    return `R$ ${formatted} mil`;
  }
  
  return formatCurrency(value);
};
