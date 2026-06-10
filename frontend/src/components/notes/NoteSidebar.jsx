import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2, Tag, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { canWriteNote } from '@/lib/notePermissions';

export default function NoteSidebar({ noteId, note, teamId, onClose }) {
  const queryClient = useQueryClient();
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags', teamId],
    queryFn: async () => (await api.get('/notes/tags', { params: teamId ? { teamId } : {} })).data.data,
  });

  const noteTags = note?.tags || [];
  const permissions = note?.permissions || [];

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

  const isOwner = note?.userPermission === 'owner';
  const canWrite = canWriteNote(note?.userPermission);

  return (
    <aside className="w-80 border-l border-[var(--color-border)] bg-[var(--color-card)] p-4 overflow-y-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Note settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4" />
          <h4 className="font-medium text-sm">Tags</h4>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {noteTags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: t.color + '25', color: t.color }}
            >
              {t.name}
              {canWrite && (
                <button type="button" onClick={() => removeTagMutation.mutate(t.id)} className="hover:opacity-70">×</button>
              )}
            </span>
          ))}
          {noteTags.length === 0 && <p className="text-xs text-[var(--color-muted-foreground)]">No tags assigned</p>}
        </div>
        {canWrite && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Add existing tag</Label>
              <div className="flex flex-wrap gap-1">
                {allTags.filter((t) => !noteTags.some((nt) => nt.id === t.id)).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => assignTagMutation.mutate(t.id)}
                    className="text-xs px-2 py-1 rounded-full border hover:bg-[var(--color-accent)]"
                    style={{ borderColor: t.color, color: t.color }}
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Label className="text-xs">Create new tag</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-8 text-sm"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-8 w-10 rounded border cursor-pointer"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={!newTagName.trim()}
                onClick={() => createTagMutation.mutate({ name: newTagName.trim(), color: newTagColor, teamId: teamId || null })}
              >
                <Plus className="h-3 w-3 mr-1" /> Create tag
              </Button>
            </div>
          </>
        )}
      </section>

      {isOwner && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="h-4 w-4" />
            <h4 className="font-medium text-sm">Share</h4>
          </div>
          {permissions.length > 0 && (
            <ul className="space-y-2 mb-3">
              {permissions.map((p) => (
                <li key={p.id} className="text-xs flex justify-between p-2 rounded bg-[var(--color-muted)]">
                  <span>{p.name || p.email}</span>
                  <span className="capitalize text-[var(--color-muted-foreground)]">{p.permission}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2">
            <Input
              placeholder="user@email.com"
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="h-8 text-sm"
            />
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="w-full h-8 rounded-md border px-2 text-sm"
            >
              <option value="read">View only</option>
              <option value="write">Can edit</option>
              <option value="owner">Owner</option>
            </select>
            <Button
              size="sm"
              className="w-full"
              disabled={!shareEmail.trim() || shareMutation.isPending}
              onClick={() => shareMutation.mutate({ email: shareEmail.trim(), permission: sharePermission })}
            >
              Share note
            </Button>
          </div>
        </section>
      )}
    </aside>
  );
}
