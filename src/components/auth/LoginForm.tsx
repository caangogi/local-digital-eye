
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Separator } from '../ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signInWithEmail, signInWithGoogle, isLoading } = useAuth();
  const t = useTranslations('AuthPage');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    signInWithEmail(data.email, data.password);
  };

  return (
    <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border border-border/50 hover:shadow-[0_0_25px_8px_hsl(var(--accent)/0.25)] transition-all duration-300">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">{t('loginTitle')}</CardTitle>
            <CardDescription>{t('loginSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emailLabel')}</FormLabel>
                  <FormControl><Input type="email" placeholder={t('emailPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <Link href="/password-reset" className="text-xs text-primary hover:underline">
                      {t('forgotPasswordLink')}
                    </Link>
                  </div>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('loginButton')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>
            
            <Button variant="outline" onClick={signInWithGoogle} className="w-full" disabled={isLoading} type="button">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-4.82 2.25-3.64 0-6.55-3-6.55-6.6s2.91-6.6 6.55-6.6c1.98 0 3.22.78 4.25 1.75l2.43-2.33C17.4.9 15.22 0 12.48 0 5.88 0 .81 5.44.81 12.15s5.07 12.15 11.67 12.15c6.48 0 11.4-4.35 11.4-11.75 0-.79-.07-1.54-.19-2.25h-11.z" />
                  </svg>
                  <span>{t('googleSignInButton')}</span>
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                {t('signUpLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
