import { getUserColor } from '@/lib/userColors';

export default function AuthorLegend({ authors, modifiers, currentUserId }) {
  if (authors.length === 0 && modifiers.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
      {authors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-muted-foreground)]">Authors:</span>
          {authors.map(({ id, name }) => {
            const color = getUserColor(id);
            const label = id === currentUserId ? `${name} (you)` : name;
            return (
              <span
                key={id}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
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
          <span className="text-xs text-[var(--color-muted-foreground)]">Modified by:</span>
          {modifiers.map(({ id, name }) => {
            const color = getUserColor(id);
            const label = id === currentUserId ? `${name} (you)` : name;
            return (
              <span
                key={id}
                className="text-xs px-2 py-0.5 rounded-full font-medium border border-dashed"
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
