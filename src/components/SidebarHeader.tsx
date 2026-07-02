import { TrendingUp } from 'lucide-react';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export default function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.04]">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <TrendingUp className="w-4 h-4 text-gray-900" />
        </div>
      </div>

      {!collapsed && (
        <div className="flex items-baseline gap-1.5 overflow-hidden">
          <span className="text-sm font-semibold text-white tracking-tight">
            CashFlow
          </span>
          <span className="text-[10px] font-medium text-gray-600">
            v2.0
          </span>
        </div>
      )}
    </div>
  );
}