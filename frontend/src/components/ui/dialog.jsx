import { createContext, useContext, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const DialogContext = createContext(null);

export function Dialog({ children, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild }) {
  const { setOpen } = useContext(DialogContext);
  if (asChild) {
    return <span onClick={() => setOpen(true)}>{children}</span>;
  }
  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

export function DialogContent({ className, children, onClose }) {
  const { open, setOpen } = useContext(DialogContext);
  if (!open) return null;

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={close} />
      <div className={cn('relative z-50 w-full max-w-md rounded-lg border bg-[var(--color-card)] p-6 shadow-lg', className)}>
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export const DialogHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
));
DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-[var(--color-muted-foreground)]', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';
