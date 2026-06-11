import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layout/AuthLayout';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    if (!token) {
      toast({ title: 'Invalid link', description: 'Reset token is missing', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast({ title: 'Password reset', description: 'You can now sign in with your new password' });
      navigate('/login');
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Reset failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="This password reset link is invalid or has expired. Request a new one to continue."
        heroTitle="Link Expired"
        heroSubtitle="For your security, reset links are only valid for a limited time."
        footer={
          <p className="text-sm text-center lg:text-left">
            <Link to="/forgot-password" className="text-[var(--color-primary)] font-semibold hover:underline">
              Request a new reset link
            </Link>
          </p>
        }
      >
        <Link to="/forgot-password">
          <Button className="w-full h-12 rounded-lg">Request Reset Link</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Choose a strong password to secure your workspace."
      heroTitle="Almost There"
      heroSubtitle="Set your new password and you'll be back to collaborating in no time."
      footer={
        <p className="text-sm text-center lg:text-left">
          <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--color-on-surface-variant)]">New Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-sm text-[var(--color-destructive)]">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[var(--color-on-surface-variant)]">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-sm text-[var(--color-destructive)]">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-lg shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 active:scale-[0.98] transition-all"
          disabled={loading}
        >
          {loading ? 'Resetting...' : (
            <>
              Reset Password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
