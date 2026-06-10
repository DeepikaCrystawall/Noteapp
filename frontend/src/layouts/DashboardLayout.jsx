import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FileText, Users, Bell, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useSocketStore } from '@/stores/socketStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const connected = useSocketStore((s) => s.connected);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      useSocketStore.getState().disconnect();
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      <aside className="w-64 border-r border-[var(--color-border)] flex flex-col">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">NoteApp</h1>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
            {connected ? '● Connected' : '○ Disconnected'}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-[var(--color-accent)] transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-[var(--color-primary)] text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
