import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';

const dotColors = [
  'bg-[var(--color-primary-container)]',
  'bg-[var(--color-secondary-container)]',
  'bg-[#b55d00]',
];

export default function ActivityTimeline({ notifications = [], empty = 'No recent activity' }) {
  if (!notifications.length) {
    return (
      <div className="glass-card rounded-xl border border-[var(--color-outline-variant)] p-6 shadow-sm">
        <p className="text-sm text-[var(--color-on-surface-variant)] text-center py-8">{empty}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-[var(--color-outline-variant)] p-6 shadow-sm">
      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-surface-variant)]">
        {notifications.map((item, i) => (
          <div key={item.id} className="relative pl-8">
            <div
              className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-[var(--color-surface)] z-10 flex items-center justify-center ${dotColors[i % dotColors.length]}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            </div>
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="text-[10px] bg-[var(--color-surface-variant)]">
                  {item.title?.[0]?.toUpperCase() || 'N'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm text-[var(--color-foreground)]">
                  <span className="font-semibold">{item.title}</span>
                </p>
                {item.message && (
                  <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 line-clamp-2">
                    {item.message}
                  </p>
                )}
                <p className="text-[10px] text-[var(--color-outline)] font-bold mt-2 uppercase">
                  {formatRelativeTime(item.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/notifications" className="block mt-6">
        <Button variant="outline" className="w-full rounded-lg text-[var(--color-on-surface-variant)]">
          View all notifications
        </Button>
      </Link>
    </div>
  );
}
