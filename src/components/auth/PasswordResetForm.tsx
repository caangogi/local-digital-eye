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
import { useState } from 'react';

const passwordResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export function PasswordResetForm() {
  const { sendPasswordResetEmail, isLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const t = useTranslations('AuthPage.passwordReset');

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: PasswordResetFormValues) => {
    await sendPasswordResetEmail(data.email);
    setIsSubmitted(true);
  };

  return (
    <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border border-border/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">{t('title')}</CardTitle>
            <CardDescription>
                {isSubmitted ? t('successDescription') : t('description')}
            </CardDescription>
          </CardHeader>
          {!isSubmitted && (
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('button')}
              </Button>
            </CardContent>
          )}
          <CardFooter className="flex justify-center text-sm">
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t('backToLogin')}
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
