import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Star, Share2, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/layout/StatCard';
import NoteCard from '@/components/notes/NoteCard';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import api from '@/services/api';

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const connected = useSocketStore((s) => s.connected);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/notes/dashboard')).data.data,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data.data,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'dashboard'],
    queryFn: async () => (await api.get('/notifications', { params: { limit: 5 } })).data,
  });

  if (isLoading) return <DashboardSkeleton />;

  const recentNotes = data?.recentNotes || [];
  const sharedNotes = data?.sharedNotes || [];
  const notifications = notificationsData?.data?.slice(0, 5) || [];

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Here's what's happening across your workspace today."
          className="mb-8"
        />

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Notes"
            value={data?.totalNotes ?? 0}
            icon={FileText}
            iconClassName="text-[var(--color-primary)] bg-[var(--color-primary-fixed)]"
          />
          <StatCard
            title="Shared With You"
            value={sharedNotes.length}
            icon={Share2}
            iconClassName="text-[var(--color-secondary)] bg-[#d3e4fe]"
            badge={
              sharedNotes.length > 0 ? (
                <span className="text-xs font-bold text-green-700 px-2 py-1 bg-green-100 rounded-full">Active</span>
              ) : null
            }
          />
          <StatCard
            title="Favorites"
            value={data?.favoriteNotes?.length ?? 0}
            icon={Star}
            iconClassName="text-[#904900] bg-[#ffdcc5]"
          />
          <StatCard
            title="Your Teams"
            value={teams.length}
            icon={Users}
            iconClassName="text-[var(--color-primary)] bg-[var(--color-primary-fixed)]"
            badge={
              connected ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  <span className="text-xs font-bold text-[var(--color-primary)]">Live</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-[var(--color-on-surface-variant)] px-2 py-1 bg-[var(--color-surface-variant)] rounded-full">
                  Offline
                </span>
              )
            }
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Recent Notes</h3>
              <Link to="/notes" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                View all
              </Link>
            </div>

            {recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl border border-[var(--color-outline-variant)] p-12 text-center">
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">No recent notes yet</p>
                <Link to="/notes/new">
                  <Button>Create your first note</Button>
                </Link>
              </div>
            )}

            {/* CTA banner */}
            <div className="relative overflow-hidden bg-[var(--color-primary)] p-8 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="z-10">
                <h3 className="text-2xl font-semibold mb-2">Collaborate in real-time</h3>
                <p className="text-base opacity-90 max-w-md">
                  Invite your team to work on notes together with live presence and instant sync.
                </p>
                <Link to="/teams">
                  <Button className="mt-6 bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface)] rounded-xl shadow-lg">
                    Manage Teams
                  </Button>
                </Link>
              </div>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                <div className="absolute inset-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageCircle className="h-16 w-16 opacity-50 fill-white/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity sidebar */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Recent Activity</h3>
            <ActivityTimeline notifications={notifications} />
          </div>
        </div>
      </div>
    </div>
  );
}
