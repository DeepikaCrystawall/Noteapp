import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function TeamsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data.data,
  });

  const { data: teamDetail } = useQuery({
    queryKey: ['team', selectedTeam],
    queryFn: async () => (await api.get(`/teams/${selectedTeam}`)).data.data,
    enabled: !!selectedTeam,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/teams', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreate(false);
      setName('');
      setDescription('');
      toast({ title: 'Team created' });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => api.post(`/teams/${selectedTeam}/members`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', selectedTeam] });
      setInviteEmail('');
      toast({ title: 'Member invited' });
    },
    onError: (err) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  if (isLoading) return <div className="p-8"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2" /> Create Team</Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <Button onClick={() => createMutation.mutate({ name, description })} disabled={!name}>Create</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {teams?.map((team) => (
            <Card key={team.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedTeam === team.id ? 'ring-2 ring-[var(--color-primary)]' : ''}`} onClick={() => setSelectedTeam(team.id)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />{team.name}</CardTitle>
                <CardDescription>{team.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent><span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent)]">{team.member_role}</span></CardContent>
            </Card>
          ))}
        </div>

        {teamDetail && (
          <Card>
            <CardHeader><CardTitle>{teamDetail.name} Members</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {teamDetail.members?.map((m) => (
                  <div key={m.user_id} className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--color-accent)]">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{m.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-muted)]">{m.role}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Email to invite" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <Button onClick={() => inviteMutation.mutate({ email: inviteEmail, role: 'editor' })}>Invite</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
