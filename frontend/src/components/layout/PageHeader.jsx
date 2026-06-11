import { cn } from '@/lib/utils';

export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8', className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground)]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm sm:text-base text-[var(--color-muted-foreground)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
