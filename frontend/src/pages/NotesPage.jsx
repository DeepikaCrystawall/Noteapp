import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/layout/PageHeader';
import NotesToolbar from '@/components/notes/NotesToolbar';
import NoteGridCard from '@/components/notes/NoteGridCard';
import NoteListRow from '@/components/notes/NoteListRow';
import AddNoteCard from '@/components/notes/AddNoteCard';
import { debounce } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

function NotesSkeleton({ view }) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
    </div>
  );
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('updated');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearch(q);
      setQuery(q);
    }
    const f = searchParams.get('filter');
    if (f && ['all', 'owned', 'shared', 'favorites', 'archived'].includes(f)) {
      setFilter(f);
    }
  }, [searchParams]);

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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Note deleted' });
    },
    onError: (err) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.post(`/notes/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Note duplicated' });
    },
    onError: (err) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const handleDelete = (note) => {
    if (!window.confirm(`Delete "${note.title || 'Untitled'}"? This cannot be undone.`)) return;
    deleteMutation.mutate(note.id);
  };

  const handleDuplicate = (note) => {
    duplicateMutation.mutate(note.id);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
  };

  const cardProps = (note) => ({
    note,
    canDelete: note.owner_id === userId,
    isShared: note.owner_id !== userId,
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-[var(--color-outline-variant)]/50">
        <PageHeader
          title="My Notes"
          description="Browse, search, and manage all your workspace notes."
          actions={
            <Button asChild className="rounded-xl shadow-sm active:scale-95 transition-transform">
              <Link to="/notes/new">
                <Plus className="h-4 w-4" />
                New Note
              </Link>
            </Button>
          }
          className="mb-0"
        />

        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-on-surface-variant)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-container-low)] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 placeholder:text-[var(--color-on-surface-variant)]/60"
          />
        </div>
      </div>

      <NotesToolbar
        filter={filter}
        onFilterChange={handleFilterChange}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      <section className="p-4 sm:p-6 flex-1">
        <div className="max-w-[1400px] mx-auto">
          {isLoading ? (
            <NotesSkeleton view={view} />
          ) : notes.length === 0 && !query ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-[var(--color-on-surface-variant)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">No notes yet</h3>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-6 max-w-sm">
                Create your first note to start collaborating with your team.
              </p>
              <Button asChild>
                <Link to="/notes/new">Create New Note</Link>
              </Button>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-[var(--color-on-surface-variant)]">No notes match your search.</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note) => (
                <NoteGridCard key={note.id} {...cardProps(note)} />
              ))}
              <AddNoteCard />
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteListRow key={note.id} {...cardProps(note)} />
              ))}
              <AddNoteCard listView />
            </div>
          )}

          {pagination.total > pagination.limit && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-[var(--color-on-surface-variant)]">
                Page {page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                variant="outline"
                disabled={page * pagination.limit >= pagination.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}

          {isFetching && !isLoading && (
            <p className="text-center text-xs text-[var(--color-on-surface-variant)] mt-4">Updating...</p>
          )}
        </div>
      </section>
    </div>
  );
}
