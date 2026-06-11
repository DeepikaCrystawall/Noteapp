import { BarChart3, Bolt, Network, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AuthHero({
  title = 'The Engine of Team Productivity',
  subtitle = 'Join teams who scale their creative workflows with CollabNotes precision tools.',
}) {
  return (
    <section className="hidden lg:flex lg:w-1/2 bg-[var(--color-surface-container)] relative overflow-hidden items-center justify-center p-12">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-secondary)]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-card rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#b55d00]/10 rounded-full animate-bounce" style={{ animationDuration: '4s' }} />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full animate-pulse" />

          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-destructive)]/40" />
              <div className="w-3 h-3 rounded-full bg-[#904900]/40" />
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]/40" />
            </div>
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((letter) => (
                <Avatar key={letter} className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarFallback className="text-[10px] bg-[var(--color-secondary-container)] text-[var(--color-secondary)]">
                    {letter}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                +4
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="h-4 w-3/4 bg-[var(--color-on-surface-variant)]/10 rounded-full shimmer" />
              <div className="h-4 w-1/2 bg-[var(--color-on-surface-variant)]/10 rounded-full shimmer" />
              <div className="p-6 rounded-xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/30">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-[var(--color-primary)]/20 rounded-full" />
                    <div className="h-3 w-2/3 bg-[var(--color-on-surface-variant)]/10 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-[var(--color-on-surface-variant)]/5 rounded-full" />
                  <div className="h-2 w-5/6 bg-[var(--color-on-surface-variant)]/5 rounded-full" />
                  <div className="h-2 w-4/6 bg-[var(--color-on-surface-variant)]/5 rounded-full" />
                </div>
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="aspect-square rounded-xl bg-[var(--color-secondary-container)]/30 border border-[var(--color-secondary)]/10 flex flex-col items-center justify-center p-4 text-center">
                <Network className="h-8 w-8 text-[var(--color-secondary)] mb-2" />
                <div className="h-2 w-full bg-[var(--color-secondary)]/20 rounded-full mb-2" />
                <div className="h-2 w-2/3 bg-[var(--color-secondary)]/10 rounded-full" />
              </div>
              <div className="aspect-square rounded-xl bg-[#ffdcc5]/30 border border-[#904900]/10 flex flex-col items-center justify-center p-4 text-center">
                <Sparkles className="h-8 w-8 text-[#904900] mb-2" />
                <div className="h-2 w-full bg-[#904900]/20 rounded-full mb-2" />
                <div className="h-2 w-2/3 bg-[#904900]/10 rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bolt className="h-5 w-5 text-[var(--color-primary)] fill-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-[var(--color-on-surface-variant)]">Real-time Sync Active</span>
            </div>
            <div className="px-4 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs font-medium">
              Live Workspace
            </div>
          </div>

          <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden xl:flex">
            <div className="bg-white shadow-xl rounded-full p-1 border border-[var(--color-outline-variant)]/20 flex items-center gap-2 pr-4">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-[var(--color-primary-container)] text-white">A</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-[var(--color-foreground)]">Alex is typing...</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center px-8">
          <h2 className="text-2xl font-semibold text-[var(--color-foreground)] mb-2">{title}</h2>
          <p className="text-base text-[var(--color-on-surface-variant)]">{subtitle}</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
        <div className="w-2 h-2 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2 h-2 rounded-full bg-[var(--color-outline-variant)]" />
      </div>
    </section>
  );
}
