import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, History, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import NoteSidebar from '@/components/notes/NoteSidebar';
import PresenceBar from '@/components/notes/PresenceBar';
import CollaborativeTextarea from '@/components/notes/CollaborativeTextarea';
import AuthorLegend from '@/components/notes/AuthorLegend';
import { canWriteNote } from '@/lib/notePermissions';
import {
  createInitialSegments,
  applyLocalEdit,
  segmentsMatchContent,
  getSegmentAuthors,
  getSegmentModifiers,
} from '@/lib/textSegments';
import { useAuthStore } from '@/stores/authStore';
import { useNoteStore } from '@/stores/noteStore';
import { useSocketStore } from '@/stores/socketStore';
import { debounce, throttle } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function NoteEditorPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const {
    collaborators, typingUsers, cursors,
    setCollaborators, addCollaborator, removeCollaborator,
    addTypingUser, removeTypingUser, updateCursor, removeCursor, clearNoteState,
  } = useNoteStore();
  const socket = useSocketStore((s) => s.socket);
  const socketConnected = useSocketStore((s) => s.connected);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [segments, setSegments] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRemoteUpdate = useRef(false);
  const typingTimeoutRef = useRef(null);
  const latestDraftRef = useRef({ title: '', content: '' });
  const segmentsRef = useRef([]);

  const isNew = noteId === 'new';

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data.data,
    enabled: isNew,
  });

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => (await api.get(`/notes/${noteId}`)).data.data,
    enabled: !isNew,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => isNew ? api.post('/notes', data) : api.put(`/notes/${noteId}`, data),
    onSuccess: (res) => {
      if (isNew) navigate(`/notes/${res.data.data.id}`, { replace: true });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Note deleted' });
      navigate('/notes');
    },
    onError: (err) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const isOwner = note?.userPermission === 'owner' || note?.owner_id === user?.id;
  const canWrite = isNew || canWriteNote(note?.userPermission);
  const isTeamNote = !isNew && !!note?.team_id;

  const handleDelete = () => {
    if (!window.confirm(`Delete "${title || 'Untitled'}"? This cannot be undone.`)) return;
    deleteMutation.mutate();
  };

  const persistNote = useCallback(
    debounce((data) => {
      if (isNew || !canWrite) return;
      api.put(`/notes/${noteId}`, data, { headers: { 'X-Autosave': 'true' } }).catch(() => { });
    }, 5000),
    [noteId, isNew, canWrite]
  );

  const broadcastEditing = useCallback(
    throttle((data) => {
      if (isNew || !canWrite || !socket?.connected) return;
      socket.emit('note:editing', { noteId, ...data });
    }, 300),
    [noteId, socket, isNew, canWrite]
  );

  const signalTyping = useCallback(() => {
    if (isNew || !canWrite || !socket?.connected) return;
    socket.emit('typing:start', { noteId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { noteId });
    }, 2000);
  }, [noteId, socket, isNew, canWrite]);

  const handleCursorChange = useCallback((position) => {
    if (isNew || !canWrite || !socket?.connected) return;
    socket.emit('cursor:update', { noteId, position });
  }, [noteId, socket, isNew, canWrite]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTeamId(note.team_id || '');
      if (note.team_id) {
        const initial = createInitialSegments(note.content, note.owner_id, note.owner_name || 'Author');
        segmentsRef.current = initial;
        setSegments(initial);
      } else {
        segmentsRef.current = [];
        setSegments([]);
      }
    }
  }, [note]);

  useEffect(() => {
    if (!socket || isNew) return;

    socket.emit('join:note', noteId);
    if (note?.team_id) socket.emit('join:team', note.team_id);

    const applyRemoteEdit = (data) => {
      if (data.updatedBy?.id === user.id) return;
      isRemoteUpdate.current = true;
      if (data.title !== undefined) setTitle(data.title);
      if (data.content !== undefined) {
        setContent(data.content);
        if (note?.team_id) {
          if (data.segments && segmentsMatchContent(data.segments, data.content)) {
            segmentsRef.current = data.segments;
            setSegments(data.segments);
          } else if (data.updatedBy?.id) {
            const next = applyLocalEdit(
              segmentsRef.current,
              data.content,
              data.updatedBy.id,
              data.updatedBy.name
            );
            segmentsRef.current = next;
            setSegments(next);
          }
        }
      }
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    };

    const handlers = {
      'note:editing': applyRemoteEdit,
      'note:update': applyRemoteEdit,
      'user:joined': (u) => addCollaborator(u),
      'user:left': (u) => {
        removeCollaborator(u.userId || u.id);
        removeCursor(u.userId || u.id);
      },
      'collaborators:active': (list) => setCollaborators(list),
      'typing:start': (u) => addTypingUser(u),
      'typing:stop': (u) => removeTypingUser(u.userId),
      'cursor:update': (data) => updateCursor(data.userId, { name: data.name, position: data.position }),
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      socket.emit('leave:note', noteId);
      socket.emit('typing:stop', { noteId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      Object.keys(handlers).forEach((event) => socket.off(event, handlers[event]));
      clearNoteState();
    };
  }, [socket, noteId, isNew, user.id, note?.team_id]);

  const pushLocalEdit = (nextTitle, nextContent, nextSegments) => {
    if (!canWrite || isRemoteUpdate.current) return;
    const payload = { title: nextTitle, content: nextContent };
    if (isTeamNote && nextSegments) payload.segments = nextSegments;
    latestDraftRef.current = payload;
    broadcastEditing(payload);
    persistNote(payload);
    signalTyping();
  };

  const handleTitleChange = (e) => {
    if (!canWrite) return;
    const val = e.target.value;
    setTitle(val);
    pushLocalEdit(val, content, isTeamNote ? segmentsRef.current : undefined);
  };

  const handleContentChange = (e) => {
    if (!canWrite) return;
    const val = e.target.value;
    setContent(val);
    if (isTeamNote) {
      const nextSegments = applyLocalEdit(segmentsRef.current, val, user.id, user.name);
      segmentsRef.current = nextSegments;
      setSegments(nextSegments);
      pushLocalEdit(title, val, nextSegments);
    } else {
      pushLocalEdit(title, val, undefined);
    }
  };

  const handleCreate = () => {
    const payload = { title, content };
    if (teamId) payload.teamId = teamId;
    saveMutation.mutate(payload);
  };

  if (!isNew && isLoading) {
    return <div className="p-8"><Skeleton className="h-8 w-64 mb-4" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/notes')}><ArrowLeft className="h-4 w-4" /></Button>
            {!isNew && (
              <PresenceBar
                socketConnected={socketConnected}
                collaborators={collaborators}
                typingUsers={typingUsers}
                currentUserId={user.id}
              />
            )}
          </div>
          <div className="flex gap-2">
            {isNew ? (
              <Button onClick={handleCreate} disabled={saveMutation.isPending}>Create Note</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSidebarOpen((o) => !o)}>
                  <Settings2 className="h-4 w-4 mr-2" /> {canWrite ? 'Share & Tags' : 'Tags'}
                </Button>
                <Button variant="outline" onClick={() => navigate(`/notes/${noteId}/history`)}>
                  <History className="h-4 w-4 mr-2" /> History
                </Button>
                {isOwner && (
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
          {isNew && (
            <div className="mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30">
              <Label htmlFor="team" className="text-sm font-medium mb-2 block">Team (optional)</Label>
              <select
                id="team"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full max-w-sm h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm"
              >
                <option value="">Personal note (no team)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                Team notes are visible to all members of the selected team.
              </p>
            </div>
          )}

          {!isNew && !canWrite && (
            <div className="mb-4 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              View only — you can read this note but not edit it (team viewer or read-only access).
            </div>
          )}

          {isTeamNote && (
            <AuthorLegend
              authors={getSegmentAuthors(segments)}
              modifiers={getSegmentModifiers(segments)}
              currentUserId={user.id}
            />
          )}

          {canWrite ? (
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 mb-4 h-auto"
            />
          ) : (
            <h1 className="text-3xl font-bold mb-4 px-0">{title || 'Untitled'}</h1>
          )}
          <CollaborativeTextarea
            value={content}
            segments={segments}
            coloredByUser={isTeamNote}
            onChange={handleContentChange}
            onCursorChange={handleCursorChange}
            remoteCursors={cursors}
            currentUserId={user.id}
            placeholder={canWrite ? 'Start writing...' : ''}
            readOnly={!canWrite}
          />
        </div>
      </div>

      {!isNew && sidebarOpen && (
        <NoteSidebar
          noteId={noteId}
          note={note}
          teamId={note?.team_id}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
