import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pin, Star, Archive, Pencil, Share2, Copy, Trash2, Lock } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NoteGridCard({
  note,
  canDelete,
  isShared,
  onDelete,
  onDuplicate,
  isDeleting,
  isDuplicating,
  className,
}) {
  const navigate = useNavigate();
  const tags = note.tags?.slice(0, 3) || [];

  const handleMenuAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'edit') navigate(`/notes/${note.id}`);
    if (action === 'share') navigate(`/notes/${note.id}`);
    if (action === 'duplicate') onDuplicate?.(note);
    if (action === 'delete') onDelete?.(note);
  };

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-6 flex flex-col h-[280px] group hover:shadow-xl transition-all duration-300 relative',
        note.is_pinned && 'border-l-4 border-l-[#b55d00]',
        note.is_archived && 'opacity-80',
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-1.5 min-w-0 flex-1 pr-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
          {note.is_favorite && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-fixed)] text-[#2f2ebe] text-xs font-medium">
              Favorite
            </span>
          )}
          {note.is_archived && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] text-xs font-medium">
              Archived
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-[var(--color-on-surface-variant)] hover:text-[var(--color-foreground)]"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={(e) => handleMenuAction(e, 'edit')}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleMenuAction(e, 'share')}>
              <Share2 className="h-4 w-4" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleMenuAction(e, 'duplicate')}
              disabled={isDuplicating}
            >
              <Copy className="h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => handleMenuAction(e, 'delete')}
                  disabled={isDeleting}
                  className="text-[var(--color-destructive)] focus:text-[var(--color-destructive)]"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={`/notes/${note.id}`} className="flex flex-col flex-1 min-h-0">
        <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
          {note.title || 'Untitled'}
        </h3>
        <p className="text-sm text-[var(--color-on-surface-variant)] flex-1 line-clamp-4">
          {note.content || 'No content yet'}
        </p>
      </Link>

      <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {note.is_pinned && <Pin className="h-3.5 w-3.5 text-[var(--color-primary)]" />}
          {note.is_favorite && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
          {note.is_archived && <Archive className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />}
          {isShared && (
            <Lock className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-wider font-bold">
            Updated
          </p>
          <p className="text-xs font-semibold text-[var(--color-foreground)]">
            {formatRelativeTime(note.updated_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
