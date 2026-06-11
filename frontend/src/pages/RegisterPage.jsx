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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      useSocketStore.getState().connect(accessToken);
      toast({ title: 'Account created!', description: 'Welcome to CollabNotes' });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Registration failed', description: err.response?.data?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Start collaborating with your team in a secure, real-time workspace."
      heroTitle="Build Together, Ship Faster"
      heroSubtitle="Create your workspace and invite teammates to collaborate on notes in real time."
      footer={
        <p className="text-sm text-[var(--color-on-surface-variant)] text-center lg:text-left">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[var(--color-on-surface-variant)]">Full Name</Label>
          <Input id="name" placeholder="Jane Cooper" {...register('name')} />
          {errors.name && <p className="text-sm text-[var(--color-destructive)]">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--color-on-surface-variant)]">Work Email</Label>
          <Input id="email" type="email" placeholder="name@company.com" {...register('email')} />
          {errors.email && <p className="text-sm text-[var(--color-destructive)]">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--color-on-surface-variant)]">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-sm text-[var(--color-destructive)]">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-lg shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 active:scale-[0.98] transition-all"
          disabled={loading}
        >
          {loading ? 'Creating account...' : (
            <>
              Create Workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
