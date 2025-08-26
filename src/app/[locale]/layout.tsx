import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import '../globals.css'; // Ensure globals are imported here for the locale layout

// Note: Metadata is usually set in the root layout or per-page, 
// but having it here can be fine for overrides.
export const metadata: Metadata = {
  title: 'Local Digital Eye',
  description: 'AI-Powered Business Analysis and Service Recommendations',
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

  // This component no longer renders <html> or <body> tags.
  // That is handled by the root layout at src/app/layout.tsx
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <Toaster />
    </NextIntlClientProvider>
  );
}
