import { cn } from '../lib/utils';
import type { Page } from '../types/page';
import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Zap,
  Receipt,
  Circle,
} from 'lucide-react';

interface SidebarNavItemProps {
  id: Page;
  icon: string;
  label: string;
  activePage: Page;
  collapsed: boolean;
  onNavigate: (page: Page) => void;
}

const iconRegistry: Record<string, React.ComponentType<LucideProps>> = {
  LayoutDashboard,
  Target,
  TrendingUp,
  Zap,
  Receipt,
  Circle,
};

function SidebarIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconRegistry[name] ?? Circle;
  return <Icon className={className} />;
}

export default function SidebarNavItem({
  id,
  icon,
  label,
  activePage,
  collapsed,
  onNavigate,
}: SidebarNavItemProps) {
  const isActive = activePage === id;

  return (
    <button
      onClick={() => onNavigate(id)}
      className={cn(
        'group relative flex items-center w-full transition-all duration-150',
        collapsed 
          ? 'justify-center py-2.5' 
          : 'gap-3 px-3 py-2',
        isActive
          ? 'text-white'
          : 'text-gray-500 hover:text-gray-300'
      )}
      title={collapsed ? label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full" />
      )}

      {/* Icon container */}
      <div
        className={cn(
          'relative flex items-center justify-center flex-shrink-0 rounded-lg transition-all duration-150',
          collapsed ? 'w-10 h-10' : 'w-8 h-8',
          isActive
            ? 'bg-white/10'
            : 'bg-transparent group-hover:bg-white/[0.03]'
        )}
      >
        <SidebarIcon
          name={icon}
          className={cn(
            'w-[18px] h-[18px] transition-all duration-150',
            isActive ? 'scale-105' : 'group-hover:scale-105'
          )}
        />
      </div>

      {/* Label */}
      {!collapsed && (
        <span className="flex-1 text-left text-sm font-medium truncate">
          {label}
        </span>
      )}

      {/* Tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md border border-white/[0.06] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </button>
  );
}