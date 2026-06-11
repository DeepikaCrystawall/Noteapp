import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2, Tag, X, Plus, Link2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { canWriteNote } from '@/lib/notePermissions';

const PERMISSION_LABELS = {
  read: 'Viewer',
  write: 'Editor',
  owner: 'Owner',
};

function PermissionRow({ person }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-container-low)] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="text-sm bg-[var(--color-primary-container)] text-white">
            {(person.name || person.email)?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {person.name || person.email}
          </p>
          {person.email && person.name && (
            <p className="text-sm text-[var(--color-on-surface-variant)] truncate">{person.email}</p>
          )}
        </div>
      </div>
      <span className="text-sm font-semibold text-[var(--color-on-surface-variant)] capitalize shrink-0 ml-2">
        {PERMISSION_LABELS[person.permission] || person.permission}
      </span>
    </div>
  );
}

export default function NoteSidebar({ noteId, note, teamId, onClose, className }) {
  const queryClient = useQueryClient();
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4648d4');
  const [activeTab, setActiveTab] = useState('share');

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags', teamId],
    queryFn: async () => (await api.get('/notes/tags', { params: teamId ? { teamId } : {} })).data.data,
  });

  const noteTags = note?.tags || [];
  const permissions = note?.permissions || [];
  const isOwner = note?.userPermission === 'owner';
  const canWrite = canWriteNote(note?.userPermission);

  const shareMutation = useMutation({
    mutationFn: (body) => api.post(`/notes/${noteId}/share`, body),
    onSuccess: () => {
      toast({ title: 'Note shared' });
      setShareEmail('');
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
    onError: (err) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const createTagMutation = useMutation({
    mutationFn: (body) => api.post('/notes/tags', body),
    onSuccess: () => {
      setNewTagName('');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag created' });
    },
  });

  const assignTagMutation = useMutation({
    mutationFn: (tagId) => api.post(`/notes/${noteId}/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: (tagId) => api.delete(`/notes/${noteId}/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/notes/${noteId}`);
      toast({ title: 'Link copied' });
    } catch {
      toast({ title: 'Could not copy link', variant: 'destructive' });
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed z-50 flex flex-col bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]',
          'inset-0 lg:inset-auto lg:top-14 lg:right-0 lg:bottom-0 lg:w-80 lg:border-l',
          className
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-[var(--color-outline-variant)] shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Share Note</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5 line-clamp-1">
              {note?.title || 'Untitled'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-outline-variant)] h-12 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={cn(
              'flex-1 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors',
              activeTab === 'share'
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
            )}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={cn(
              'flex-1 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors',
              activeTab === 'tags'
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
            )}
          >
            <Tag className="h-4 w-4" />
            Tags
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {activeTab === 'share' && isOwner && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[var(--color-on-surface-variant)]">
                Invite by email
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="name@company.com"
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value)}
                  className="h-10 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-3 text-sm font-semibold"
                >
                  <option value="write">Editor</option>
                  <option value="read">Viewer</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <Button
                className="w-full rounded-lg"
                disabled={!shareEmail.trim() || shareMutation.isPending}
                onClick={() => shareMutation.mutate({ email: shareEmail.trim(), permission: sharePermission })}
              >
                Invite
              </Button>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--color-on-surface-variant)]">
                People with access
              </h3>
              <div className="border border-[var(--color-outline-variant)] rounded-xl overflow-hidden bg-white divide-y divide-[var(--color-outline-variant)]">
                {permissions.length > 0 ? (
                  permissions.map((p) => <PermissionRow key={p.id} person={p} />)
                ) : (
                  <p className="p-4 text-sm text-[var(--color-on-surface-variant)]">
                    Only you have access to this note.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <section>
              <div className="flex flex-wrap gap-2 mb-4">
                {noteTags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${t.color}25`, color: t.color }}
                  >
                    {t.name}
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => removeTagMutation.mutate(t.id)}
                        className="hover:opacity-70 ml-0.5"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {noteTags.length === 0 && (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">No tags assigned</p>
                )}
              </div>

              {canWrite && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                      Add existing tag
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.filter((t) => !noteTags.some((nt) => nt.id === t.id)).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => assignTagMutation.mutate(t.id)}
                          className="text-xs px-2.5 py-1 rounded-full border hover:bg-[var(--color-surface-container-high)] transition-colors"
                          style={{ borderColor: t.color, color: t.color }}
                        >
                          + {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                      Create new tag
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="h-9 w-10 rounded-lg border border-[var(--color-outline-variant)] cursor-pointer"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-lg"
                      disabled={!newTagName.trim()}
                      onClick={() => createTagMutation.mutate({
                        name: newTagName.trim(),
                        color: newTagColor,
                        teamId: teamId || null,
                      })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Create tag
                    </Button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-surface-container)] border-t border-[var(--color-outline-variant)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-foreground)]">Restricted</p>
              <p className="text-[10px] text-[var(--color-on-surface-variant)] truncate">
                Only people added can open
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={handleCopyLink}>
              <Link2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy Link</span>
            </Button>
            <Button size="sm" className="rounded-lg" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
