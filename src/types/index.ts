export interface BudgetInputs {
  salary: number;
  helpAtHome: number;
  saveAmount: number;
  emergencyFund: number;
}

export interface MonthlySnapshot {
  id: string;
  month: number;
  year: number;
  salary: number;
  helpAtHome: number;
  saveAmount: number;
  emergencyFund: number;
  totalSaved: number;
  remaining: number;
  savingsRate: number;
  timestamp: string;
}

export interface BudgetSummary {
  totalReceived: number;
  helpAtHome: number;
  totalSaved: number;
  saveAmount: number;
  emergencyFund: number;
  remaining: number;
  savingsRate: number;
  expensePercentage: number;
  dailyExpensesTotal: number;
  dailyExpensesCount: number;
  projections: {
    months6: number;
    months12: number;
    months24: number;
  };
  distribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export type SuggestionType = 'alert' | 'warning' | 'tip' | 'success';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  message: string;
  action?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  createdAt: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

export interface CategoryBudget {
  category: string;
  limit: number;
  spent: number;
}

export interface RecurringExpense {
  id: string;
  name: string;
  value: number;
  dueDay: number;
  paidThisMonth: boolean;
  category?: string;
  isEssential?: boolean;
}

export type ExpenseCategoryType =
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'moradia'
  | 'assinaturas'
  | 'compras'
  | 'outros';

export const EXPENSE_CATEGORIES: { value: ExpenseCategoryType; label: string; color: string; icon: string }[] = [
  { value: 'alimentacao', label: 'Alimentação', color: '#f97316', icon: 'Utensils' },
  { value: 'transporte', label: 'Transporte', color: '#3b82f6', icon: 'Car' },
  { value: 'lazer', label: 'Lazer', color: '#a855f7', icon: 'Gamepad2' },
  { value: 'saude', label: 'Saúde', color: '#22c55e', icon: 'Heart' },
  { value: 'educacao', label: 'Educação', color: '#6366f1', icon: 'BookOpen' },
  { value: 'moradia', label: 'Moradia', color: '#ef4444', icon: 'Home' },
  { value: 'assinaturas', label: 'Assinaturas', color: '#ec4899', icon: 'Radio' },
  { value: 'compras', label: 'Compras', color: '#d97706', icon: 'ShoppingBag' },
  { value: 'outros', label: 'Outros', color: '#6b7280', icon: 'MoreHorizontal' },
];

export interface DailyExpense {
  id: string;
  amount: number;
  category: ExpenseCategoryType;
  description: string;
  date: string;
  createdAt: string;
}

export interface SpendingByCategory {
  category: ExpenseCategoryType;
  total: number;
  percentage: number;
  count: number;
}