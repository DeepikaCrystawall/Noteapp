import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pin, Star, Archive, Pencil, Share2, Copy, Trash2 } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NoteListRow({
  note,
  canDelete,
  onDelete,
  onDuplicate,
  isDeleting,
  isDuplicating,
  className,
}) {
  const navigate = useNavigate();

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
        'glass-card rounded-xl p-4 flex items-center gap-4 group hover:shadow-md transition-all border border-[var(--color-outline-variant)]/50',
        note.is_pinned && 'border-l-4 border-l-[#b55d00]',
        className
      )}
    >
      <Link to={`/notes/${note.id}`} className="flex-1 min-w-0 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {note.is_pinned && <Pin className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />}
            {note.is_favorite && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
            {note.is_archived && <Archive className="h-3.5 w-3.5 text-[var(--color-muted-foreground)] shrink-0" />}
            <h3 className="font-semibold text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-colors">
              {note.title || 'Untitled'}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)] truncate">
            {note.content?.slice(0, 160) || 'No content yet'}
          </p>
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {note.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] shrink-0 hidden sm:block">
          {formatRelativeTime(note.updated_at)}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => handleMenuAction(e, 'edit')}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleMenuAction(e, 'share')}>
            <Share2 className="h-4 w-4" /> Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleMenuAction(e, 'duplicate')} disabled={isDuplicating}>
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
  );
}
