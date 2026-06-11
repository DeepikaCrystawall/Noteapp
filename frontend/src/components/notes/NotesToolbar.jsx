import { ChevronDown, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FILTERS = [
  { value: 'all', label: 'All Notes' },
  { value: 'owned', label: 'My Notes' },
  { value: 'shared', label: 'Shared' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'archived', label: 'Archived' },
];

const SORTS = [
  { value: 'updated', label: 'Recently Edited' },
  { value: 'latest', label: 'Latest Created' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A–Z' },
];

export default function NotesToolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  className,
}) {
  const sortLabel = SORTS.find((s) => s.value === sort)?.label || 'Sort';

  return (
    <section
      className={cn(
        'px-4 sm:px-6 py-4 bg-[var(--color-surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-outline-variant)]/50',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors',
              filter === value
                ? 'bg-[var(--color-secondary-container)] text-[#54647a] border-transparent'
                : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container-high)]'
            )}
          >
            {label}
          </button>
        ))}

        <div className="hidden sm:block h-6 w-px bg-[var(--color-outline-variant)] mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 bg-[var(--color-surface-container-low)] px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] transition-colors"
            >
              Sort: {sortLabel}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SORTS.map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onSortChange(value)}
                className={sort === value ? 'text-[var(--color-primary)] font-semibold' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1 bg-[var(--color-surface-container-high)] p-1 rounded-lg shrink-0">
        <button
          type="button"
          onClick={() => onViewChange('grid')}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            view === 'grid'
              ? 'bg-white shadow-sm text-[var(--color-primary)]'
              : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-foreground)]'
          )}
          aria-label="Grid view"
        >
          <Grid3x3 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            view === 'list'
              ? 'bg-white shadow-sm text-[var(--color-primary)]'
              : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-foreground)]'
          )}
          aria-label="List view"
        >
          <List className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
