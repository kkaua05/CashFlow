import Sidebar from './Sidebar';
import type { Page } from '../types/page';

interface LayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export default function Layout({ activePage, onNavigate, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#070708] text-white flex">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[220px] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8 md:px-10 lg:px-14 pt-20 md:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}