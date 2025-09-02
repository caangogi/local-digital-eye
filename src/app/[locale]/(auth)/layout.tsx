import type React from 'react';
import { Eye, Globe } from 'lucide-react';
import { Link } from "@/navigation"; // Use next-intl's Link
import {useTranslations} from 'next-intl';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import Image from 'next/image';

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
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/consultoria-e8a9c.appspot.com/o/Images%2Flogo-consultoria.png?alt=media&token=c270a057-36ab-443c-b1cd-c98495cad4b7"
                alt="ConsultorIA Logo"
                width={150}
                height={40}
                priority
            />
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
