import type { BudgetInputs, MonthlySnapshot } from '../types';

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// 📊 Análise de Tendências
export function analyzeCategoryTrends(history: MonthlySnapshot[]) {
  if (history.length < 2) return [];
  
  const trends: { category: string; trend: 'up' | 'down' | 'stable'; change: number; avg: number }[] = [];
  const fields = ['helpAtHome', 'saveAmount', 'emergencyFund'];

  fields.forEach(cat => {
    const values = history.map(h => {
      if (cat === 'helpAtHome') return h.helpAtHome;
      if (cat === 'saveAmount') return h.saveAmount;
      if (cat === 'emergencyFund') return h.emergencyFund;
      return 0;
    });

    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
    const previous = values.slice(-6, -3).reduce((a, b) => a + b, 0) / Math.min(3, values.length) || recent;
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 15) trend = 'up';
    else if (change < -15) trend = 'down';

    if (recent > 0) {
      trends.push({ 
        category: cat === 'helpAtHome' ? 'Ajuda em Casa' : cat === 'saveAmount' ? 'Guardar' : 'Imprevistos', 
        trend, change, avg: recent 
      });
    }
  });

  return trends;
}

// 🔮 Previsão (Regressão Linear Simples)
export function predictNextMonth(history: MonthlySnapshot[]): number | null {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const n = sorted.length;
  const x = sorted.map((_, i) => i);
  const y = sorted.map(h => h.salary - h.helpAtHome - h.saveAmount - h.emergencyFund);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return sumY / n;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return Math.max(0, slope * n + intercept);
}

// 🚨 Detecção de Anomalias
export function detectAnomalies(inputs: BudgetInputs, history: MonthlySnapshot[]) {
  if (history.length < 3) return [];
  
  const currentTotal = inputs.helpAtHome + inputs.saveAmount + inputs.emergencyFund;
  const pastTotals = history.map(h => h.helpAtHome + h.saveAmount + h.emergencyFund);
  const avg = pastTotals.reduce((a, b) => a + b, 0) / pastTotals.length;
  const stdDev = Math.sqrt(pastTotals.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / pastTotals.length);
  
  if (currentTotal > avg + 2 * stdDev) {
    return [{
      isAnomaly: true,
      message: `⚠️ Gastos atuais estão ${((currentTotal / avg - 1) * 100).toFixed(0)}% acima da sua média histórica.`
    }];
  }
  return [{ isAnomaly: false, message: '' }];
}

// 💡 Gerador de Insights
export function generateAIInsights(inputs: BudgetInputs, history: MonthlySnapshot[]) {
  const insights: string[] = [];
  const prediction = predictNextMonth(history);
  const anomalies = detectAnomalies(inputs, history);
  const trends = analyzeCategoryTrends(history);

  // Anomalias
  if (anomalies[0]?.isAnomaly) insights.push(anomalies[0].message);

  // Tendências
  trends.forEach(t => {
    if (t.trend === 'up') insights.push(`📈 ${t.category} subiu ${t.change.toFixed(1)}% recentemente.`);
    if (t.trend === 'down') insights.push(`📉 ${t.category} caiu ${Math.abs(t.change).toFixed(1)}%. Continue assim!`);
  });

  // Previsão
  if (prediction !== null) {
    const remaining = inputs.salary - inputs.helpAtHome - inputs.saveAmount - inputs.emergencyFund;
    const diff = prediction - remaining;
    if (diff > 0) {
      insights.push(`🔮 Previsão: Próximo mês deve ter ${formatBRL(diff)} a mais disponível que este mês.`);
    } else {
      insights.push(`🔮 Projeção: Saldo disponível previsto de ${formatBRL(prediction)}.`);
    }
  }

  // Sugestões baseadas na distribuição
  if (inputs.salary > 0) {
    const helpPct = inputs.helpAtHome / inputs.salary;
    const savePct = inputs.saveAmount / inputs.salary;
    const emergencyPct = inputs.emergencyFund / inputs.salary;

    if (savePct < 0.1) {
      insights.push(`💡 Tente guardar pelo menos 10% da renda. Atualmente está em ${(savePct * 100).toFixed(1)}%.`);
    }
    if (helpPct > 0.5) {
      insights.push(`🏠 A contribuição para casa está acima de 50% da renda. Considere conversar com os colegas.`);
    }
    if (emergencyPct === 0 && inputs.salary > 0) {
      insights.push(`🛡️ Sem reserva para imprevistos! Mesmo R$50/mês já faz diferença.`);
    }
    if (savePct >= 0.2) {
      insights.push(`🎯 Excelente! Você guarda ${(savePct * 100).toFixed(1)}% da renda. Continue assim!`);
    }
  }

  return insights;
}