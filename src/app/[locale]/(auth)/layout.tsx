import type React from 'react';
import { Eye, Globe } from 'lucide-react';
import { Link } from "@/navigation"; // Use next-intl's Link
import {useTranslations} from 'next-intl';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('AuthLayout');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
            </svg>
          <span className="font-bold text-lg font-headline">{t('title')}</span>
        </Link>
      </div>
       <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>
      <main className="w-full max-w-md">
        {children}
      </main>
       <footer className="absolute bottom-8 text-center text-muted-foreground text-sm">
        <p dangerouslySetInnerHTML={{ __html: t.markup('footer', { year: new Date().getFullYear() }) }}/>
      </footer>
    </div>
  );
}
