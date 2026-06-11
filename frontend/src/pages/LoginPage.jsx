import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      useSocketStore.getState().connect(accessToken);
      toast({ title: 'Welcome back!', description: `Signed in as ${user.name}` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Login failed', description: err.response?.data?.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Continue your collaborative journey and sync your ideas instantly."
      footer={
        <p className="text-sm text-[var(--color-on-surface-variant)] text-center lg:text-left">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[var(--color-primary)] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--color-on-surface-variant)]">Work Email</Label>
          <Input id="email" type="email" placeholder="name@company.com" {...register('email')} />
          {errors.email && <p className="text-sm text-[var(--color-destructive)]">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-[var(--color-on-surface-variant)]">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-sm text-[var(--color-destructive)]">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-lg shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 active:scale-[0.98] transition-all"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : (
            <>
              Sign In to Workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
