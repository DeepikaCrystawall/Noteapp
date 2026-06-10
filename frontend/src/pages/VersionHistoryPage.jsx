import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function VersionHistoryPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['versions', noteId],
    queryFn: async () => (await api.get(`/notes/${noteId}/versions`)).data,
  });

  const restoreMutation = useMutation({
    mutationFn: (version) => api.post(`/notes/${noteId}/versions/${version}/restore`),
    onSuccess: () => {
      toast({ title: 'Version restored' });
      navigate(`/notes/${noteId}`);
    },
  });

  const versions = data?.data || [];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/notes/${noteId}`)}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">Version History</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <Card key={v.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div>
                  <CardTitle className="text-base">Version {v.version_number}</CardTitle>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{v.created_by_name} · {formatDate(v.created_at)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => restoreMutation.mutate(v.version_number)}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Restore
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-medium">{v.title}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1 line-clamp-3">{v.content}</p>
              </CardContent>
            </Card>
          ))}
          {versions.length === 0 && <p className="text-center text-[var(--color-muted-foreground)]">No versions yet</p>}
        </div>
      )}
    </div>
  );
}
