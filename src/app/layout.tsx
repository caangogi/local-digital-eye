// This is the new root layout for non-internationalized paths,
// if you still need them, or it can be minimal if middleware handles all.
// For this setup, we assume next-intl middleware handles redirection to [locale]
// so this file might not be directly rendered for main user paths.
// However, Next.js requires a root layout.tsx.

import type {Metadata} from 'next';
import './globals.css'; // globals.css is still needed here for global styles
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Local Digital Eye', // General title
  description: 'AI-Powered Business Analysis and Service Recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang attribute will be set by src/app/[locale]/layout.tsx for i18n routes
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
