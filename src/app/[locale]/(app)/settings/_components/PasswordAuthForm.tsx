
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordAuthForm() {
  const { user, linkEmailAndPassword, isProviderPasswordEnabled, unlinkPasswordProvider, sendPasswordResetEmail, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await linkEmailAndPassword(data.password);
      toast({
        title: 'Password Set Successfully',
        description: 'You can now sign in with your email and password.',
      });
      reset();
    } catch (error: any) {
      toast({
        title: 'Error Setting Password',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    setIsSubmitting(true);
    try {
        await unlinkPasswordProvider();
        toast({
            title: 'Password Sign-In Removed',
            description: 'You can no longer sign in with a password.',
        });
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSubmitting(true);
    try {
        await sendPasswordResetEmail();
        toast({
            title: 'Password Reset Email Sent',
            description: `A reset link has been sent to ${user.email}.`,
        });
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p>Loading security settings...</p>;
  }

  if (isProviderPasswordEnabled) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Password sign-in is enabled for your account.</p>
            <Button onClick={handlePasswordReset} variant="outline" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Password Reset Email
            </Button>
            <Button onClick={handleUnlink} variant="destructive" className="w-full" disabled={isSubmitting}>
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Remove Password Sign-In
            </Button>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">Add a password to your account to enable signing in with email and password.</p>
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Set Password
      </Button>
    </form>
  );
}
