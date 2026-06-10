import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', data);
      setSent(true);
      if (res.data.data?.resetToken) {
        const token = res.data.data.resetToken;
        toast({
          title: 'Dev mode',
          description: 'Use the link below to reset your password.',
        });
        setResetLink(`${window.location.origin}/reset-password?token=${token}`);
      } else {
        toast({ title: 'Check your email', description: res.data.message });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            {sent ? (resetLink ? 'Use this link to reset your password (development)' : 'Check your email for reset instructions') : 'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent && resetLink && (
            <div className="mb-4 p-3 rounded-md bg-[var(--color-muted)] text-sm break-all">
              <a href={resetLink} className="text-[var(--color-primary)] hover:underline">{resetLink}</a>
            </div>
          )}
          {!sent && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-[var(--color-destructive)]">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>Send reset link</Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-[var(--color-primary)] hover:underline">Back to login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
