
import type React from 'react';
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { NextIntlClientProvider, useMessages } from 'next-intl';

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  // By wrapping the entire application in the providers here,
  // any child component or layout can now safely use their respective hooks.
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
