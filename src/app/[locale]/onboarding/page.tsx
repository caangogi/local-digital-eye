import { Suspense } from 'react';
import { OnboardingView } from "./_components/OnboardingView";
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  // We'll create a new namespace for this page
  const t = await getTranslations('OnboardingPage'); 
  return {
    title: t('title')
  };
}

const OnboardingPageError = ({ message }: { message: string }) => {
    const t = getTranslations('OnboardingPage.errors');
    return (
         <Card className="w-full max-w-lg text-center shadow-2xl">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-destructive"><AlertTriangle/> Error de Invitación</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{message}</p>
                <Link href="/" className="text-sm text-primary hover:underline mt-4 inline-block">Volver a la página principal</Link>
            </CardContent>
        </Card>
    )
}

// This is the Server Component wrapper.
// It sets up the layout and Suspense boundary for the client component.
export default function OnboardingPage({
  searchParams,
}: {
  searchParams: { token?: string, error?: string };
}) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
       {/* Decorative gradient */}
       <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-15"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)',
              filter: 'blur(100px)' 
            }}>
      </div>
      
      <header className="w-full py-8 px-4 sm:px-8 flex justify-center items-center relative z-10">
         <Link href="/">
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
      </header>
      
      <main className="w-full max-w-2xl z-10 flex-grow flex items-center justify-center px-4 py-8">
        <Suspense fallback={<p>Loading...</p>}>
           {searchParams.token ? (
                <OnboardingView token={searchParams.token} />
            ) : (
                <OnboardingPageError message="El enlace de invitación no es válido o está incompleto. Asegúrate de usar el enlace completo que te proporcionaron."/>
            )}
        </Suspense>
      </main>

       <footer className="w-full text-center text-muted-foreground text-sm z-10 py-8 px-4">
        <p>&copy; {year} Local Digital Eye. Tu socio en crecimiento digital.</p>
      </footer>
    </div>
  );
}
