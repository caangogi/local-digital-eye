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
import Image from "next/image";

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const { signUpWithEmail, signInWithGoogle, isLoading } = useAuth();
  const t = useTranslations('AuthPage');

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (data: SignUpFormValues) => {
    signUpWithEmail(data.name, data.email, data.password);
  };

  return (
    <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border border-border/50 hover:shadow-[0_0_25px_8px_hsl(var(--accent)/0.25)] transition-all duration-300">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">{t('signupTitle')}</CardTitle>
            <CardDescription>{t('signupSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nameLabel')}</FormLabel>
                  <FormControl><Input placeholder={t('namePlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signupButton')}
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
                <div className="flex items-center justify-center">
                  <Image src="/google-logo.svg" alt="Google Logo" width={20} height={20} className="mr-2 bg-white rounded-full p-0.5"/>
                  <span>{t('googleSignInButton')}</span>
                </div>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">
              {t('alreadyAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('loginLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
