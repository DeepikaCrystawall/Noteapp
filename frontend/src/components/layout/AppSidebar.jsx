import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Bell, Settings, LogOut, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveAssetUrl } from '@/config/env';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useSocketStore } from '@/stores/socketStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

export default function AppSidebar({ onNavigate, className }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const connected = useSocketStore((s) => s.connected);

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  const handleClick = () => onNavigate?.();

  return (
    <aside className={cn('flex flex-col h-full py-4 px-2 bg-[var(--color-surface-container-low)]', className)}>
      <div className="px-4 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-container)] flex items-center justify-center text-white shrink-0">
            <PenSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--color-primary)] truncate">CollabNotes</h1>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              {connected ? '● Live sync' : '○ Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-6">
        <Button asChild className="w-full rounded-xl h-10 gap-2 shadow-sm active:scale-95 transition-transform">
          <Link to="/notes/new" onClick={handleClick}>
            <span className="text-lg leading-none">+</span>
            New Note
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={handleClick}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all',
                active
                  ? 'bg-[var(--color-secondary-container)] text-[#54647a]'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] hover:text-[var(--color-foreground)]'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active && 'fill-current')} />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="bg-[var(--color-primary)] text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 px-4 border-t border-[var(--color-outline-variant)]/50">
        <div className="flex items-center gap-3 py-3">
          <Avatar className="h-9 w-9 border border-[var(--color-outline-variant)]">
              <AvatarImage src={resolveAssetUrl(user?.avatar_url)} />
            <AvatarFallback className="text-xs bg-[var(--color-primary-container)] text-white">
              {user?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)] truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SidebarLogoutButton({ onLogout }) {
  return (
    <Button variant="outline" size="sm" className="w-full mx-4 mb-2 max-w-[calc(100%-2rem)]" onClick={onLogout}>
      <LogOut className="h-4 w-4 mr-2" /> Sign out
    </Button>
  );
}
