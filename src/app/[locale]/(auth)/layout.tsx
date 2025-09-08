import type React from 'react';
import { Eye, Globe } from 'lucide-react';
import { Link } from "@/navigation";
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import Image from 'next/image';


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/local-digital-eye.firebasestorage.app/o/public%2Fimages%2Fds.png?alt=media&token=d12ae2c6-310e-4044-bc9b-77d60b6fe4cf"
                alt="ConsultorIA Logo"
                width={150}
                height={40}
                priority
                className="dark:hidden"
            />
             <Image 
                src="https://firebasestorage.googleapis.com/v0/b/local-digital-eye.firebasestorage.app/o/public%2Fimages%2Flogo-consultoria.png?alt=media&token=f336b89c-4641-4b04-b90d-c6658b6bf773"
                alt="ConsultorIA Logo"
                width={150}
                height={40}
                priority
                className="hidden dark:block"
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
        <p>&copy; {year} Local Digital Eye. Your partner in digital growth.</p>
      </footer>
    </div>
  );
}
