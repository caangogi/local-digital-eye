// This is the root layout for non-internationalized paths.
// With next-intl, this should be minimal and delegate HTML structure to src/app/[locale]/layout.tsx.

// Remove Metadata export, CSS imports, font links, and Toaster.
// These will be handled by src/app/[locale]/layout.tsx.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The root layout should just return children when using next-intl's recommended setup.
  // The actual <html> and <body> tags will be rendered by src/app/[locale]/layout.tsx.
  return children;
}
