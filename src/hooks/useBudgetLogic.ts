import { useMemo } from 'react';
import type { BudgetInputs, BudgetSummary, Suggestion } from '../types';
import { useBudgetStore } from '../store/budgetStore';

const DISTRIBUTION_COLORS = {
  helpAtHome: '#6366f1',
  saveAmount: '#10b981',
  emergencyFund: '#f59e0b',
  remaining: '#6b7280',
};

export function useBudgetLogic(inputs: BudgetInputs) {
  const dailyExpenses = useBudgetStore((s) => s.dailyExpenses);

  const summary = useMemo<BudgetSummary>(() => {
    const totalReceived = inputs.salary;
    const helpAtHome = inputs.helpAtHome;
    const saveAmount = inputs.saveAmount;
    const emergencyFund = inputs.emergencyFund;
    const totalSaved = saveAmount + emergencyFund;
    
    // Calculate daily expenses for current month
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const currentMonthExpenses = dailyExpenses.filter(
      e => e.date.startsWith(`${year}-${monthStr}`)
    );
    const dailyExpensesTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const remaining = Math.max(0, totalReceived - helpAtHome - saveAmount - emergencyFund - dailyExpensesTotal);
    const expensePercentage = totalReceived > 0 
      ? ((helpAtHome + saveAmount + emergencyFund + dailyExpensesTotal) / totalReceived) * 100 
      : 0;
    const savingsRate = totalReceived > 0 ? (totalSaved / totalReceived) * 100 : 0;

    const distribution = [
      { name: 'Ajuda em Casa', value: helpAtHome, color: DISTRIBUTION_COLORS.helpAtHome },
      { name: 'Guardar', value: saveAmount, color: DISTRIBUTION_COLORS.saveAmount },
      { name: 'Imprevistos', value: emergencyFund, color: DISTRIBUTION_COLORS.emergencyFund },
      { name: 'Gastos Diários', value: dailyExpensesTotal, color: '#ef4444' },
      { name: 'Disponível', value: remaining, color: DISTRIBUTION_COLORS.remaining },
    ].filter(d => d.value > 0);

    return {
      totalReceived,
      helpAtHome,
      totalSaved,
      saveAmount,
      emergencyFund,
      remaining,
      savingsRate,
      expensePercentage,
      dailyExpensesTotal,
      dailyExpensesCount: currentMonthExpenses.length,
      projections: {
        months6: totalSaved * 6,
        months12: totalSaved * 12,
        months24: totalSaved * 24,
      },
      distribution,
    };
  }, [inputs, dailyExpenses]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const s: Suggestion[] = [];
    const { savingsRate, helpAtHome, remaining, dailyExpensesTotal } = summary;

    if (inputs.salary === 0) {
      return [{
        id: '1',
        type: 'alert',
        message: 'Informe seu salário para gerar a análise.'
      }];
    }

    if (helpAtHome === 0 && inputs.salary > 0) {
      s.push({ 
        id: '2', 
        type: 'warning', 
        message: 'Você não definiu um valor para ajudar em casa. Combinar um valor fixo com os colegas ajuda a organizar as finanças.',
        action: 'Definir contribuição mensal'
      });
    }

    if (savingsRate < 20 && inputs.salary > 0) {
      s.push({ 
        id: '3', 
        type: 'tip', 
        message: 'Tente guardar pelo menos 20% da sua renda para construir uma reserva sólida.',
        action: 'Reveja gastos supérfluos'
      });
    }

    if (savingsRate >= 30) {
      s.push({ 
        id: '4', 
        type: 'success', 
        message: 'Excelente taxa de economia! Você está construindo um futuro financeiro sólido.' 
      });
    }

    if (remaining <= 0 && inputs.salary > 0) {
      s.push({ 
        id: '5', 
        type: 'alert', 
        message: 'Sua renda está totalmente comprometida. Reveja os valores de contribuição e economia.',
        action: 'Reequilibrar orçamento'
      });
    }

    if (inputs.emergencyFund === 0 && inputs.salary > 0) {
      s.push({ 
        id: '6', 
        type: 'warning', 
        message: 'Você não está destinando nada para imprevistos. Uma reserva de emergência é essencial.',
        action: 'Definir valor mensal para imprevistos'
      });
    }

    if (savingsRate >= 10 && savingsRate < 20) {
      s.push({ 
        id: '7', 
        type: 'tip', 
        message: 'Bom começo! Tente aumentar sua taxa de economia para 20% para acelerar seus objetivos.' 
      });
    }

    // New suggestions based on daily expenses
    if (dailyExpensesTotal > 0 && inputs.salary > 0) {
      const expenseRatio = (dailyExpensesTotal / inputs.salary) * 100;
      if (expenseRatio > 30) {
        s.push({
          id: '8',
          type: 'warning',
          message: `Seus gastos diários representam ${expenseRatio.toFixed(0)}% do seu salário. Tente reduzir para no máximo 30%.`,
          action: 'Revisar gastos diários'
        });
      }
      if (expenseRatio <= 15 && dailyExpensesTotal > 0) {
        s.push({
          id: '9',
          type: 'success',
          message: 'Ótimo controle de gastos diários! Você está gastando pouco com despesas do dia a dia.'
        });
      }
    }

    return s;
  }, [summary, inputs]);

  return { summary, suggestions };
}