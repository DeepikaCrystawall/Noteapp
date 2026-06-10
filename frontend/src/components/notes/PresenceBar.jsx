import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getUserColor } from '@/lib/userColors';

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
}) {
  const othersTyping = typingUsers.filter((u) => u.userId !== currentUserId);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {socketConnected && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      )}
      <Users className="h-4 w-4 text-[var(--color-muted-foreground)]" />
      {collaborators.map((c) => {
        const color = getUserColor(c.id);
        return (
          <Avatar
            key={c.id}
            className="h-6 w-6 -ml-1 border-2"
            style={{ borderColor: color.ring }}
            title={`${c.name} · ${color.name}`}
          >
            <AvatarFallback className="text-xs" style={{ backgroundColor: color.bg, color: color.text }}>
              {c.name?.[0]}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {collaborators.length > 0 && (
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {collaborators.length + 1} viewing
        </span>
      )}
      {othersTyping.map((u) => (
        <TypingChip key={u.userId} user={u} />
      ))}
    </div>
  );
}
