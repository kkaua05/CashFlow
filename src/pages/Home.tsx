import { useState } from 'react';
import FinancialForm from '../components/FinancialForm';
import Dashboard from '../components/Dashboard';
import SuggestionsPanel from '../components/SuggestionsPanel';
import Layout from '../components/Layout';
import AIInsightsPanel from '../components/AIInsightsPanel';
import AdvancedGoals from '../components/AdvancedGoals';
import RecurringAndImport from '../components/RecurringAndImport';
import FinancialHeatmap from '../components/FinancialHeatmap';
import ReportsPage from '../components/ReportsPage';
import SnapshotButton from '../components/SnapshotButton';
import SpendingAnalysis from '../components/SpendingAnalysis';
import type { Page } from '../types/page';

export default function Home() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <Layout activePage={page} onNavigate={setPage}>
      {page === 'dashboard' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div />
              <SnapshotButton />
            </div>
            <FinancialForm />
            <Dashboard />
          </div>
          <div className="xl:col-span-1 space-y-8">
            <AIInsightsPanel />
            <SuggestionsPanel />
          </div>
        </div>
      ) : page === 'expenses' ? (
        <SpendingAnalysis />
      ) : page === 'reports' ? (
        <ReportsPage />
      ) : page === 'goals' ? (
        <AdvancedGoals />
      ) : page === 'automation' ? (
        <RecurringAndImport />
      ) : null}
    </Layout>
  );
}