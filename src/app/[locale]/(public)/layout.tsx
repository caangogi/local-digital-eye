import type React from 'react';

// This is a simple layout for all public-facing pages.
// It doesn't contain any authentication logic or sidebars.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
