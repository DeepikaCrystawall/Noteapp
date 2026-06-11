import { Link } from 'react-router-dom';
import {
  ArrowLeft, Share2, History, Star, Trash2, MoreHorizontal,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PresenceBar from '@/components/notes/PresenceBar';

export default function EditorToolbar({
  isNew,
  noteId,
  lastSaved,
  socketConnected,
  collaborators,
  typingUsers,
  currentUserId,
  isFavorite,
  isOwner,
  canWrite,
  onShare,
  onFavorite,
  onDelete,
  onCreate,
  isCreating,
  isDeleting,
  isFavoriting,
  className,
}) {
  return (
    <header
      className={cn(
        'h-14 shrink-0 sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)]',
        'flex items-center justify-between gap-3 px-4 lg:px-6',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link to="/notes" aria-label="Back to notes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {!isNew && (
          <>
            <span className="hidden sm:inline text-sm text-[var(--color-on-surface-variant)] shrink-0">
              {lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Unsaved changes'}
            </span>
            <div className="hidden sm:block h-4 w-px bg-[var(--color-outline-variant)] shrink-0" />
            <PresenceBar
              socketConnected={socketConnected}
              collaborators={collaborators}
              typingUsers={typingUsers}
              currentUserId={currentUserId}
              compact
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isNew ? (
          <Button onClick={onCreate} disabled={isCreating} className="rounded-lg">
            {isCreating ? 'Creating...' : 'Create Note'}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-1.5 hidden sm:inline-flex"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(isFavorite && 'text-yellow-500')}
              onClick={onFavorite}
              disabled={isFavoriting}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-yellow-500')} />
            </Button>

            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <Link to={`/notes/${noteId}/history`} title="Version history">
                <History className="h-4 w-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShare} className="sm:hidden">
                  <Share2 className="h-4 w-4" /> Share & Tags
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link to={`/notes/${noteId}/history`}>
                    <History className="h-4 w-4" /> Version History
                  </Link>
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="text-[var(--color-destructive)] focus:text-[var(--color-destructive)]"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Note
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isOwner && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg hidden md:inline-flex"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
