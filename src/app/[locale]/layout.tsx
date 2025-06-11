import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import '../globals.css'; // Ensure globals are imported

export const metadata: Metadata = {
  title: 'Local Digital Eye',
  description: 'AI-Powered Business Analysis and Service Recommendations',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {locale: string};
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: RootLayoutProps) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
