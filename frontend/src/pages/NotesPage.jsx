import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pin, Star, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, debounce } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('updated');
  const [page, setPage] = useState(1);

  const debouncedSearch = useMemo(() => debounce((v) => { setQuery(v); setPage(1); }, 300), []);

  const params = useMemo(() => {
    const p = { q: query, sort, page, limit: 20 };
    if (filter === 'archived') p.archived = true;
    if (filter === 'favorites') p.favorites = true;
    if (filter === 'owned') p.owned = true;
    if (filter === 'shared') p.shared = true;
    return p;
  }, [query, sort, filter, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notes', params],
    queryFn: async () => (await api.get('/notes', { params })).data,
    refetchOnMount: 'always',
  });

  const notes = data?.data || [];
  const pagination = data?.pagination || {};

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Note deleted' });
    },
    onError: (err) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const handleDelete = (e, note) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${note.title || 'Untitled'}"? This cannot be undone.`)) return;
    deleteMutation.mutate(note.id);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Link to="/notes/new"><Button><Plus className="h-4 w-4 mr-2" /> New Note</Button></Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
          />
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="h-10 rounded-md border px-3 text-sm">
          <option value="all">All Notes</option>
          <option value="owned">Owned</option>
          <option value="shared">Shared</option>
          <option value="favorites">Favorites</option>
          <option value="archived">Archived</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-md border px-3 text-sm">
          <option value="updated">Last Updated</option>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4 flex items-start gap-2">
                <Link to={`/notes/${note.id}`} className="flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {note.is_pinned && <Pin className="h-3 w-3 text-[var(--color-primary)]" />}
                      {note.is_favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      {note.is_archived && <Archive className="h-3 w-3 text-[var(--color-muted-foreground)]" />}
                      <h3 className="font-semibold truncate">{note.title}</h3>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] truncate mt-1">{note.content?.slice(0, 120)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[var(--color-muted-foreground)]">{formatDate(note.updated_at)}</span>
                      {note.tags?.length > 0 && note.tags.map((t) => (
                        <span key={t.id} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: t.color + '20', color: t.color }}>{t.name}</span>
                      ))}
                    </div>
                  </div>
                </Link>
                {note.owner_id === userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-destructive)] hover:text-[var(--color-destructive)]"
                    onClick={(e) => handleDelete(e, note)}
                    disabled={deleteMutation.isPending}
                    title="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {notes.length === 0 && <p className="text-center text-[var(--color-muted-foreground)] py-12">No notes found</p>}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-[var(--color-muted-foreground)]">Page {page}</span>
          <Button variant="outline" disabled={page * pagination.limit >= pagination.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
      {isFetching && !isLoading && <p className="text-center text-xs text-[var(--color-muted-foreground)] mt-2">Updating...</p>}
    </div>
  );
}
