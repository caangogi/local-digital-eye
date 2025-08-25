// The root layout now defines the main HTML structure.
// src/app/[locale]/layout.tsx will provide the content FOR this layout.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Local Digital Eye',
  description: 'AI-Powered Business Analysis and Service Recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The root layout must define <html> and <body>
  return (
    // The lang and other attributes will be inherited from the child layout (src/app/[locale]/layout.tsx)
    // but the tags themselves must exist here.
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
