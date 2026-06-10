import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notificationStore';
import api from '@/services/api';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { setNotifications, setUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.data);
      setUnreadCount(data.pagination?.unreadCount || 0);
    }
  }, [data]);

  const readMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: (_, id) => { markAsRead(id); queryClient.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => { markAllAsRead(); queryClient.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const notifications = data?.data || [];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bell className="h-7 w-7" /> Notifications</h1>
        <Button variant="outline" size="sm" onClick={() => readAllMutation.mutate()}>
          <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.is_read ? 'border-[var(--color-primary)] bg-[var(--color-accent)]/30' : ''}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{n.message}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{formatDate(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => readMutation.mutate(n.id)}>Mark read</Button>
                )}
              </CardContent>
            </Card>
          ))}
          {notifications.length === 0 && <p className="text-center text-[var(--color-muted-foreground)] py-12">No notifications</p>}
        </div>
      )}
    </div>
  );
}
