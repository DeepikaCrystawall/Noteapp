import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getUserColor } from '@/lib/userColors';
import { cn } from '@/lib/utils';

function TypingChip({ user }) {
  const color = getUserColor(user.userId);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium animate-pulse"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.cursor }} />
      {user.name} typing
    </span>
  );
}

export default function PresenceBar({
  socketConnected,
  collaborators,
  typingUsers,
  currentUserId,
  compact = false,
  className,
}) {
  const othersTyping = typingUsers.filter((u) => u.userId !== currentUserId);
  const visibleCollaborators = collaborators.slice(0, compact ? 3 : 5);
  const overflow = collaborators.length - visibleCollaborators.length;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap min-w-0', className)}>
      {socketConnected && compact && (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] shrink-0">
          <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          Live
        </span>
      )}

      {collaborators.length > 0 && (
        <div className="flex items-center -space-x-2 shrink-0">
          {visibleCollaborators.map((c) => {
            const color = getUserColor(c.id);
            return (
              <Avatar
                key={c.id}
                className="h-6 w-6 border-2 border-[var(--color-surface)]"
                style={{ boxShadow: `0 0 0 1px ${color.ring}` }}
                title={c.name}
              >
                <AvatarFallback
                  className="text-[10px] font-bold"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {c.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            );
          })}
          {overflow > 0 && (
            <div className="w-6 h-6 rounded-full bg-[var(--color-secondary-container)] text-[#54647a] flex items-center justify-center text-[10px] font-bold border-2 border-[var(--color-surface)]">
              +{overflow}
            </div>
          )}
        </div>
      )}

      {!compact && socketConnected && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      )}

      {!compact && collaborators.length > 0 && (
        <span className="text-xs text-[var(--color-on-surface-variant)]">
          {collaborators.length + 1} viewing
        </span>
      )}

      {othersTyping.map((u) => (
        <TypingChip key={u.userId} user={u} />
      ))}
    </div>
  );
}
