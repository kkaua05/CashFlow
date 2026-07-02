import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  BudgetInputs, 
  FinancialGoal, 
  MonthlySnapshot, 
  CategoryBudget, 
  RecurringExpense,
  DailyExpense,
  ExpenseCategoryType
} from '../types';

interface BudgetState {
  inputs: BudgetInputs;
  goals: FinancialGoal[];
  history: MonthlySnapshot[];
  categoryBudgets: CategoryBudget[];
  recurringExpenses: RecurringExpense[];
  dailyExpenses: DailyExpense[];
  
  setInputs: (inputs: Partial<BudgetInputs> | BudgetInputs) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoalProgress: (id: string, current: number) => void;
  removeGoal: (id: string) => void;
  
  saveSnapshot: () => void;
  clearHistory: () => void;
  
  setCategoryBudget: (category: string, limit: number) => void;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  updateRecurringExpense: (id: string, data: Partial<Omit<RecurringExpense, 'id'>>) => void;
  removeRecurringExpense: (id: string) => void;
  toggleRecurringPaid: (id: string) => void;
  applyRecurringToCurrentMonth: () => void;

  // Daily expenses
  addDailyExpense: (expense: Omit<DailyExpense, 'id' | 'createdAt'>) => void;
  removeDailyExpense: (id: string) => void;
  updateDailyExpense: (id: string, data: Partial<Omit<DailyExpense, 'id' | 'createdAt'>>) => void;
  getTodayExpenses: () => DailyExpense[];
  getCurrentMonthExpenses: () => DailyExpense[];
  getExpensesByDateRange: (start: string, end: string) => DailyExpense[];
  getMonthExpensesTotal: (month: number, year: number) => number;
}

const defaultInputs: BudgetInputs = {
  salary: 0,
  helpAtHome: 0,
  saveAmount: 0,
  emergencyFund: 0,
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      goals: [],
      history: [],
      categoryBudgets: [],
      recurringExpenses: [],
      dailyExpenses: [],
      
      setInputs: (partial) =>
        set((state) => ({ inputs: { ...state.inputs, ...(partial as Partial<BudgetInputs>) } })),

      addGoal: ({ name, target, current, deadline, priority }) =>
        set((state) => ({
          goals: [...state.goals, { 
            id: crypto.randomUUID(), 
            name, target, current, deadline, priority,
            createdAt: new Date().toISOString() 
          }]
        })),

      updateGoalProgress: (id, current) =>
        set((state) => ({
          goals: state.goals.map((goal) => goal.id === id ? { ...goal, current: Math.min(current, goal.target) } : goal)
        })),

      removeGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

      saveSnapshot: () => {
        const { inputs, recurringExpenses } = get();
        const totalSaved = inputs.saveAmount + inputs.emergencyFund;
        const paidRecurring = recurringExpenses
          .filter(e => e.paidThisMonth)
          .reduce((sum, e) => sum + e.value, 0);
        const dailyTotal = get().getCurrentMonthExpenses()
          .reduce((sum, e) => sum + e.amount, 0);
        const remaining = inputs.salary - inputs.helpAtHome - inputs.saveAmount - inputs.emergencyFund - paidRecurring - dailyTotal;
        const savingsRate = inputs.salary > 0 ? ((totalSaved) / inputs.salary) * 100 : 0;

        set((state) => ({
          history: [{
            id: crypto.randomUUID(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            salary: inputs.salary,
            helpAtHome: inputs.helpAtHome,
            saveAmount: inputs.saveAmount,
            emergencyFund: inputs.emergencyFund,
            totalSaved,
            remaining: Math.max(0, remaining),
            savingsRate,
            timestamp: new Date().toISOString(),
          }, ...state.history]
        }));
      },

      clearHistory: () => set({ history: [] }),

      setCategoryBudget: (category, limit) => {
        set((state) => {
          const exists = state.categoryBudgets.find(b => b.category === category);
          if (exists) {
            return {
              categoryBudgets: state.categoryBudgets.map(b => b.category === category ? { ...b, limit } : b)
            };
          }
          return { categoryBudgets: [...state.categoryBudgets, { category, limit, spent: 0 }] };
        });
      },

      addRecurringExpense: ({ name, value, dueDay, paidThisMonth, category, isEssential }) => {
        set((state) => ({
          recurringExpenses: [...state.recurringExpenses, { id: crypto.randomUUID(), name, value, dueDay, paidThisMonth, category, isEssential }]
        }));
      },

      updateRecurringExpense: (id, data) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.map(e => e.id === id ? { ...e, ...data } : e)
        }));
      },

      removeRecurringExpense: (id) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.filter(e => e.id !== id)
        }));
      },

      toggleRecurringPaid: (id) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.map(e => e.id === id ? { ...e, paidThisMonth: !e.paidThisMonth } : e)
        }));
      },

      applyRecurringToCurrentMonth: () => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.map(e => ({ ...e, paidThisMonth: true }))
        }));
      },

      // Daily Expenses
      addDailyExpense: ({ amount, category, description, date }) => {
        set((state) => ({
          dailyExpenses: [{
            id: crypto.randomUUID(),
            amount,
            category,
            description,
            date,
            createdAt: new Date().toISOString(),
          }, ...state.dailyExpenses]
        }));
      },

      removeDailyExpense: (id) => {
        set((state) => ({
          dailyExpenses: state.dailyExpenses.filter(e => e.id !== id)
        }));
      },

      updateDailyExpense: (id, data) => {
        set((state) => ({
          dailyExpenses: state.dailyExpenses.map(e => e.id === id ? { ...e, ...data } : e)
        }));
      },

      getTodayExpenses: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyExpenses.filter(e => e.date === today);
      },

      getCurrentMonthExpenses: () => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return get().dailyExpenses.filter(e => e.date.startsWith(`${year}-${month}`));
      },

      getExpensesByDateRange: (start, end) => {
        return get().dailyExpenses.filter(e => e.date >= start && e.date <= end);
      },

      getMonthExpensesTotal: (month, year) => {
        const monthStr = String(month).padStart(2, '0');
        return get().dailyExpenses
          .filter(e => e.date.startsWith(`${year}-${monthStr}`))
          .reduce((sum, e) => sum + e.amount, 0);
      },
    }),
    { 
      name: 'fincontrol-store',
      partialize: (state) => ({
        inputs: state.inputs,
        goals: state.goals,
        history: state.history,
        categoryBudgets: state.categoryBudgets,
        recurringExpenses: state.recurringExpenses,
        dailyExpenses: state.dailyExpenses,
      }),
    }
  )
);