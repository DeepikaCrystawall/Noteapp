import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AddNoteCard({ className, listView = false }) {
  if (listView) {
    return (
      <Link
        to="/notes/new"
        className={cn(
          'flex items-center justify-center gap-3 border-2 border-dashed border-[var(--color-outline-variant)] rounded-xl p-6',
          'hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-300 group',
          className
        )}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-sm font-semibold text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]">
          Create New Note
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/notes/new"
      className={cn(
        'border-2 border-dashed border-[var(--color-outline-variant)] rounded-xl p-6 flex flex-col items-center justify-center h-[280px]',
        'hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-300 group cursor-pointer',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
        <Plus className="h-8 w-8" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]">
        Create New Note
      </p>
    </Link>
  );
}
