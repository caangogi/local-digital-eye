"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth.tsx";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import Image from "next/image";

export function LoginForm() {
  const { signInWithGoogle, isLoading } = useAuth();
  const t = useTranslations('LoginForm');

  return (
    <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border border-border/50 hover:shadow-[0_0_25px_8px_hsl(var(--accent)/0.25)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">{t('welcome')}</CardTitle>
        <CardDescription className="text-center">
          {t('signInToAccess')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        <Button 
          onClick={signInWithGoogle} 
          className="w-full bg-primary hover:bg-primary/90 text-lg py-6" 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <div className="flex items-center justify-center">
              <Image src="/google-logo.svg" alt="Google Logo" width={24} height={24} className="mr-3 bg-white rounded-full p-1"/>
              <span>Sign in with Google</span>
            </div>
          )}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/" className="font-medium text-primary hover:underline">
            {t('signUpLink')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
