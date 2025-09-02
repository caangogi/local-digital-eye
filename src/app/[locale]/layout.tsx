import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getRequestConfig } from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import '../globals.css'; 
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: 'Local Digital Eye',
  description: 'AI-Powered Business Analysis and Service Recommendations',
  icons: {
    icon: 'https://firebasestorage.googleapis.com/v0/b/consultoria-e8a9c.appspot.com/o/Images%2Ficono-consultoria.png?alt=media&token=b8070931-c56e-4559-82d4-0a763e98b92d'
  }
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {locale: string};
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: LocaleLayoutProps) {
  const messages = await getMessages();
  const { timeZone } = await getRequestConfig({locale});

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone={timeZone}
          >
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
