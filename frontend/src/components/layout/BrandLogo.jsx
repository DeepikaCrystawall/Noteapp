import { PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BrandLogo({ className, showText = true }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white shrink-0">
        <PenSquare className="h-5 w-5" />
      </div>
      {showText && (
        <span className="text-xl font-bold text-[var(--color-primary)]">CollabNotes</span>
      )}
    </div>
  );
}
