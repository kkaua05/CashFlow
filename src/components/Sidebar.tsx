import { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import SidebarHeader from './SidebarHeader';
import SidebarNavItem from './SidebarNavItem';
import type { Page } from '../types/page';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  id: Page;
  icon: 'LayoutDashboard' | 'Target' | 'TrendingUp' | 'Zap' | 'Receipt';
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Menu',
    items: [
      { id: 'dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { id: 'goals', icon: 'Target', label: 'Metas' },
      { id: 'expenses', icon: 'Receipt', label: 'Gastos' },
      { id: 'reports', icon: 'TrendingUp', label: 'Relatórios' },
      { id: 'automation', icon: 'Zap', label: 'Automação' },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const handleNavigate = useCallback(
    (page: Page) => {
      onNavigate(page);
      if (mobileOpen) setMobileOpen(false);
    },
    [onNavigate, mobileOpen]
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <SidebarHeader collapsed={false} />

      <nav className="flex-1 px-2 py-4 space-y-4" aria-label="Navegação principal">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  activePage={activePage}
                  collapsed={false}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 h-full z-30',
          'w-[220px] bg-[#0a0a0b] border-r border-white/[0.04]',
          'transition-all duration-300',
          mounted ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-0 top-0 h-full w-[220px] bg-[#0a0a0b] border-r border-white/[0.04] shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          'md:hidden fixed top-3 left-3 z-50',
          'w-9 h-9 bg-[#0a0a0b] border border-white/[0.06] rounded-lg',
          'flex items-center justify-center',
          'text-gray-500 hover:text-white transition-colors',
          mobileOpen && 'hidden'
        )}
        aria-label="Abrir menu"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Close Button */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed top-3 left-[236px] z-50 w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          aria-label="Fechar menu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  );
}