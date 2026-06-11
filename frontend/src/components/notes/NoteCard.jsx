import { Link } from 'react-router-dom';
import { cn, formatRelativeTime } from '@/lib/utils';

export default function NoteCard({ note, className }) {
  const tags = note.tags?.slice(0, 2) || [];

  return (
    <Link
      to={`/notes/${note.id}`}
      className={cn(
        'block bg-white border border-[var(--color-outline-variant)] p-6 rounded-xl',
        'hover:border-[var(--color-primary)] transition-all group cursor-pointer shadow-sm hover:shadow-lg',
        className
      )}
    >
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
          {note.is_favorite && (
            <span className="text-xs px-2 py-0.5 bg-[var(--color-primary-fixed)] text-[#2f2ebe] rounded-full">
              Favorite
            </span>
          )}
        </div>
      )}

      <h4 className="text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors mb-2 line-clamp-1">
        {note.title || 'Untitled'}
      </h4>

      {note.content && (
        <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2 mb-4">
          {note.content}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-outline-variant)]">
        <span className="text-[10px] uppercase font-bold text-[var(--color-on-surface-variant)]">
          {formatRelativeTime(note.updated_at)}
        </span>
      </div>
    </Link>
  );
}
