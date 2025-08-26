import type { Metadata } from "next";
import './globals.css'; // Import global styles here

export const metadata: Metadata = {
  title: 'Local Digital Eye',
  description: 'AI-Powered Business Analysis and Service Recommendations',
};

export default function RootLayout({
  children,
  params, // The root layout can receive params, including locale
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  return (
    // The lang attribute is now correctly set on the single <html> tag.
    <html lang={params.locale} suppressHydrationWarning className="dark">
      <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      {/* The single <body> tag with all necessary classes */}
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
