import { getUserColor } from '@/lib/userColors';
import { cn } from '@/lib/utils';

export default function AuthorLegend({ authors, modifiers, currentUserId, className }) {
  if (authors.length === 0 && modifiers.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 p-3 rounded-xl',
        'bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50',
        className
      )}
    >
      {authors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide">
            Authors
          </span>
          {authors.map(({ id, name }) => {
            const color = getUserColor(id);
            const label = id === currentUserId ? `${name} (you)` : name;
            return (
              <span
                key={id}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
      {modifiers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide">
            Modified by
          </span>
          {modifiers.map(({ id, name }) => {
            const color = getUserColor(id);
            const label = id === currentUserId ? `${name} (you)` : name;
            return (
              <span
                key={id}
                className="text-xs px-2.5 py-1 rounded-full font-medium border border-dashed"
                style={{ borderColor: color.cursor, color: color.text }}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
