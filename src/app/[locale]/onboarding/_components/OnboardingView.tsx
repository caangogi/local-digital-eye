
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle, Building } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Business } from '@/backend/business/domain/business.entity';
import { validateOnboardingToken } from '@/actions/onboarding.actions';

interface OnboardingViewProps {
  token: string;
}

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Tu nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Introduce una dirección de email válida." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});
type SignUpFormValues = z.infer<typeof signUpSchema>;

// A more specific loading state component
const LoadingState = () => (
    <Card className="w-full max-w-lg text-center shadow-2xl animate-pulse">
        <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto mt-2"></div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
        </CardContent>
        <CardFooter>
            <div className="h-10 bg-muted rounded w-full"></div>
        </CardFooter>
    </Card>
);

// A more specific error state component
const ErrorState = ({ message }: { message: string }) => (
    <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive"><AlertTriangle/> Error de Invitación</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{message}</p>
        </CardContent>
    </Card>
);


export function OnboardingView({ token }: OnboardingViewProps) {
  const { signUpWithEmail, isLoading: isAuthLoading } = useAuth();
  const t = useTranslations('OnboardingPage');
  
  const [validationState, setValidationState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const businessDetails = await validateOnboardingToken(token);
        setBusiness(businessDetails);
        setValidationState('valid');
      } catch (e: any) {
        setError(e.message);
        setValidationState('invalid');
      }
    };
    validateToken();
  }, [token]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (data: SignUpFormValues) => {
    // In a future step, we'll associate this new user with the business.
    signUpWithEmail(data.name, data.email, data.password);
  };

  if (validationState === 'loading') {
    return <LoadingState />;
  }

  if (validationState === 'invalid' || !business) {
    return <ErrorState message={error || "Ha ocurrido un error desconocido."} />;
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-sm border border-border/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">{t('form.title')}</CardTitle>
            <CardDescription>{t('form.subtitle')}</CardDescription>
             <div className="!mt-4 p-3 bg-muted/50 border rounded-lg text-sm text-left">
                <p className="font-semibold flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /> {t('businessInfoLabel')}</p>
                <p className="font-bold text-primary pl-6">{business.name}</p>
                <p className="text-xs text-muted-foreground pl-6">{business.address}</p>
             </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.nameLabel')}</FormLabel>
                  <FormControl><Input placeholder={t('form.namePlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.emailLabel')}</FormLabel>
                  <FormControl><Input type="email" placeholder={t('form.emailPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.passwordLabel')}</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isAuthLoading} className="w-full">
              {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('form.button')}
            </Button>
            <p className="text-xs text-muted-foreground">{t('form.terms')}</p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
