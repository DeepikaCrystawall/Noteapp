import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-lg border p-4 shadow-lg transition-all',
            toast.variant === 'destructive'
              ? 'border-[var(--color-destructive)] bg-[var(--color-destructive)] text-white'
              : 'border-[var(--color-border)] bg-[var(--color-card)]'
          )}
        >
          <div>
            {toast.title && <p className="font-semibold">{toast.title}</p>}
            {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="ml-4 opacity-70 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}
