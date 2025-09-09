

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
import { Loader2, AlertTriangle, Building, Eye, EyeOff, Info, MailCheck, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Business } from '@/backend/business/domain/business.entity';
import { validateOnboardingToken } from '@/actions/onboarding.actions';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ONBOARDING_BUSINESS_ID_KEY = 'onboardingBusinessId';


interface OnboardingViewProps {
  token: string;
}

const EmailVerificationView = () => {
    const t = useTranslations('OnboardingPage');
    const { authAction, resendVerificationEmail, isLoading, checkVerificationStatus } = useAuth();

    return (
        <Card className="w-full max-w-lg text-center shadow-2xl">
            <CardHeader className="items-center">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                    <MailCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline">¡Ya casi estamos!</CardTitle>
                <CardDescription>
                    Hemos enviado un enlace de verificación a <br/>
                    <strong className="text-foreground">{authAction?.email}</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground">Por favor, haz clic en el enlace de ese correo para activar tu cuenta. Si no lo encuentras, revisa tu carpeta de spam.</p>
                
                <Button onClick={checkVerificationStatus} disabled={isLoading} className="mt-4">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Ya he verificado mi email
                </Button>
            </CardContent>
            <CardFooter className="flex-col gap-4 border-t pt-6">
                <p className="text-xs text-muted-foreground">¿No has recibido el correo?</p>
                <Button variant="outline" onClick={resendVerificationEmail} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Reenviar Email de Verificación
                </Button>
            </CardFooter>
        </Card>
    );
};


const signUpSchema = z.object({
  name: z.string().min(2, { message: "Tu nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Introduce una dirección de email válida." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

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

const ErrorState = ({ messageKey }: { messageKey: string }) => {
    const t = useTranslations('OnboardingPage.errors');
    return (
        <Card className="w-full max-w-lg text-center shadow-2xl">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-destructive"><AlertTriangle/> Error de Invitación</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t(messageKey)}</p>
            </CardContent>
        </Card>
    );
};


export function OnboardingView({ token }: OnboardingViewProps) {
  const { signUpWithEmail, signInWithGoogle, isLoading: isAuthLoading, authAction } = useAuth();
  const t = useTranslations('OnboardingPage');
  
  const [validationState, setValidationState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [business, setBusiness] = useState<Business | null>(null);
  const [errorKey, setErrorKey] = useState<string>('invalidLink');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const businessDetails = await validateOnboardingToken(token);
        setBusiness(businessDetails);
        localStorage.setItem(ONBOARDING_BUSINESS_ID_KEY, businessDetails.id);
        console.log(`[OnboardingView] Business ID ${businessDetails.id} saved to localStorage.`);
        setValidationState('valid');
      } catch (e: any) {
        setErrorKey(e.message || 'invalidLink');
        localStorage.removeItem(ONBOARDING_BUSINESS_ID_KEY);
        setValidationState('invalid');
      }
    };
    validateToken();
  }, [token]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: SignUpFormValues) => {
    signUpWithEmail(data.name, data.email, data.password);
  };
  
  if (authAction?.status === 'awaiting_verification') {
    return <EmailVerificationView />;
  }

  if (validationState === 'loading') {
    return <LoadingState />;
  }

  if (validationState === 'invalid' || !business) {
    return <ErrorState messageKey={errorKey} />;
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
             <Alert variant="default" className="border-primary/30">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs text-muted-foreground">
                    Para una conexión más rápida, usa el mismo email con el que gestionas tu Perfil de Negocio en Google.
                </AlertDescription>
            </Alert>
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
                   <div className="relative">
                        <FormControl>
                            <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                             />
                        </FormControl>
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                   <div className="relative">
                        <FormControl>
                            <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                             />
                        </FormControl>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                   </div>
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
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O</span>
              </div>
            </div>
            <Button variant="outline" onClick={signInWithGoogle} className="w-full" disabled={isAuthLoading} type="button">
               {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                <>
                  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-4.82 2.25-3.64 0-6.55-3-6.55-6.6s2.91-6.6 6.55-6.6c1.98 0 3.22.78 4.25 1.75l2.43-2.33C17.4.9 15.22 0 12.48 0 5.88 0 .81 5.44.81 12.15s5.07 12.15 11.67 12.15c6.48 0 11.4-4.35 11.4-11.75 0-.79-.07-1.54-.19-2.25h-11.z" />
                  </svg>
                  <span>Crear cuenta con Google</span>
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground pt-2">{t('form.terms')}</p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
