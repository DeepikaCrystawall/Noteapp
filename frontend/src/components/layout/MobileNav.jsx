import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/teams', icon: Users, label: 'Teams' },
];

export default function MobileNav({ onMenuClick }) {
  const location = useLocation();

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)] h-16 flex items-center justify-around z-50 pb-safe">
      {items.slice(0, 2).map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            'flex flex-col items-center gap-0.5 min-w-[3.5rem]',
            isActive(to) ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'
          )}
        >
          <Icon className={cn('h-5 w-5', isActive(to) && 'fill-current')} />
          <span className="text-[10px] font-bold">{label}</span>
        </Link>
      ))}

      <div className="relative -top-5">
        <Link
          to="/notes/new"
          className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/40 active:scale-90 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {items.slice(2).map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            'flex flex-col items-center gap-0.5 min-w-[3.5rem]',
            isActive(to) ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'
          )}
        >
          <Icon className={cn('h-5 w-5', isActive(to) && 'fill-current')} />
          <span className="text-[10px] font-bold">{label}</span>
        </Link>
      ))}

      <button
        type="button"
        onClick={onMenuClick}
        className="flex flex-col items-center gap-0.5 min-w-[3.5rem] text-[var(--color-on-surface-variant)]"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-bold">Menu</span>
      </button>
    </nav>
  );
}
