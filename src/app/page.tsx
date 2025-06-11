// This page is now just a placeholder or redirector if all traffic goes to [locale]
// The actual landing page content is in src/app/[locale]/page.tsx
// next-intl middleware should redirect from / to /<defaultLocale>

// You can make this a client component to use `useRouter` from `next/navigation` for a redirect,
// or configure middleware to handle the root path redirection.
// For simplicity, we'll assume middleware handles the redirect.
// This page might be shown briefly or not at all.

export default function RootPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
      <p>Loading...</p>
    </div>
  );
}
