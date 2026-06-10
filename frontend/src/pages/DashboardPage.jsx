import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Star, Share2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import api from '@/services/api';

function NoteList({ notes, empty }) {
  if (!notes?.length) return <p className="text-sm text-[var(--color-muted-foreground)]">{empty}</p>;
  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <Link key={note.id} to={`/notes/${note.id}`} className="block p-3 rounded-md hover:bg-[var(--color-accent)] transition-colors">
          <p className="font-medium truncate">{note.title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">{formatDate(note.updated_at)}</p>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/notes/dashboard')).data.data,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[var(--color-muted-foreground)]">Your collaboration overview</p>
        </div>
        <Link to="/notes/new">
          <Button><Plus className="h-4 w-4 mr-2" /> New Note</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.totalNotes || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.favoriteNotes?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shared</CardTitle>
            <Share2 className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.sharedNotes?.length || 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Notes</CardTitle></CardHeader>
          <CardContent><NoteList notes={data?.recentNotes} empty="No recent notes" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Shared With You</CardTitle></CardHeader>
          <CardContent><NoteList notes={data?.sharedNotes} empty="No shared notes" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
