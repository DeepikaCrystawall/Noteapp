import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveAssetUrl } from '@/config/env';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export default function AppHeader({ onMenuClick, className }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/notes?q=${encodeURIComponent(q)}`);
    else navigate('/notes');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between gap-4 h-14 px-4 lg:px-6 bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)]',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-on-surface-variant)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-container-low)] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]/50"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link to="/notifications" className="relative p-2 rounded-full hover:bg-[var(--color-surface-container-high)] transition-colors">
          <Bell className="h-5 w-5 text-[var(--color-primary)]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-destructive)] rounded-full border border-[var(--color-surface)]" />
          )}
        </Link>

        <Link to="/profile" className="hidden sm:block">
          <Avatar className="h-8 w-8 border border-[var(--color-outline-variant)] cursor-pointer hover:ring-2 hover:ring-[var(--color-primary)]/20 transition-all">
            <AvatarImage src={resolveAssetUrl(user?.avatar_url)} />
            <AvatarFallback className="text-xs">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
