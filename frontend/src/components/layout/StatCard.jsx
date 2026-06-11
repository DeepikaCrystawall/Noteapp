import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, iconClassName, badge, className }) {
  return (
    <div
      className={cn(
        'glass-card p-6 rounded-xl border border-[var(--color-outline-variant)] shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        {Icon && (
          <span className={cn('p-2 rounded-lg inline-flex', iconClassName)}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        {badge}
      </div>
      <p className="text-sm font-semibold text-[var(--color-on-surface-variant)] mb-1">{title}</p>
      <p className="text-2xl font-semibold text-[var(--color-foreground)] tracking-tight">{value}</p>
    </div>
  );
}
