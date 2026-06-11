import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <AuthLayout
      title="Reset Password"
      subtitle={
        sent
          ? (resetLink ? 'Use this link to reset your password (development)' : 'Check your email for reset instructions')
          : 'Enter your email and we\'ll send you a reset link.'
      }
      heroTitle="Secure Account Recovery"
      heroSubtitle="We'll help you get back into your workspace quickly and securely."
      footer={
        <p className="text-sm text-center lg:text-left">
          <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent && resetLink && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-muted)] text-sm break-all border border-[var(--color-outline-variant)]/50">
          <a href={resetLink} className="text-[var(--color-primary)] hover:underline">{resetLink}</a>
        </div>
      )}

      {!sent && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--color-on-surface-variant)]">Work Email</Label>
            <Input id="email" type="email" placeholder="name@company.com" {...register('email')} />
            {errors.email && <p className="text-sm text-[var(--color-destructive)]">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-lg shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 active:scale-[0.98] transition-all"
            disabled={loading}
          >
            {loading ? 'Sending...' : (
              <>
                Send Reset Link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
