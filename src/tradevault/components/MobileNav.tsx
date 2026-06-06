import { LayoutDashboard, BookOpen, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { Page } from '../types';
import { cn } from '../utils/cn';

interface MobileNavProps {
  page: Page;
  setPage: (p: Page) => void;
  onAddTrade: () => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
];

export default function MobileNav({ page, setPage, onAddTrade }: MobileNavProps) {
  return (
    <div className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bottom-nav">
      <div className="w-full glass-strong border-t border-white/[0.06]">
        <div className="flex items-end justify-around px-2 pt-2 pb-2">
          {navItems.map(({ id, label, icon: Icon }, idx) => (
            <div key={id} className="flex items-center">
              {idx === 2 && (
                <button onClick={onAddTrade} className="fab-button text-white mx-2 -mt-5">
                  <span className="text-2xl font-light leading-none">+</span>
                </button>
              )}
              <button
                onClick={() => setPage(id)}
                className={cn(
                  'bottom-nav-item',
                  page === id ? 'text-blue-400' : 'text-slate-600'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-semibold">{label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
