
import { Link } from "@/navigation";
import {useTranslations} from 'next-intl';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { HeroSection } from "@/components/home-sections/HeroSection";
import { ServicesSection } from "@/components/home-sections/ServicesSection";
import { PillarsSection } from "@/components/home-sections/PillarsSection";
import { PricingSection } from "@/components/home-sections/PricingSection";
import { ComparisonSection } from "@/components/home-sections/ComparisonSection";
import { CtaSection } from "@/components/home-sections/CtaSection";
import Image from "next/image";


export default function LandingPage() {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       {/* Decorative Background Gradients */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[80vw] h-[80vh] md:w-[70vw] md:h-[80vh] opacity-30"
             style={{
               background: 'radial-gradient(ellipse at bottom right, hsl(var(--accent) / 0.5) 0%, hsl(var(--background)) 70%)',
               filter: 'blur(30px)'
             }}>
        </div>
         <div className="absolute top-0 left-0 w-[50vw] h-[50vh] md:w-[40vw] md:h-[50vh] opacity-20"
             style={{
               background: 'radial-gradient(ellipse at top left, hsl(var(--primary) / 0.3) 0%, hsl(var(--background)) 70%)',
               filter: 'blur(40px)'
             }}>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
             <Image 
                src="https://firebasestorage.googleapis.com/v0/b/consultoria-e8a9c.appspot.com/o/Images%2Flogo-consultoria.png?alt=media&token=c270a057-36ab-443c-b1cd-c98495cad4b7"
                alt="ConsultorIA Logo"
                width={150}
                height={40}
                priority
            />
          </Link>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
          </nav>
        </header>

        <main className="flex-grow">
          <HeroSection />
          <ServicesSection />
          <PillarsSection />
          <PricingSection />
          <ComparisonSection />
          <CtaSection />
        </main>

        <footer className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground border-t border-border/30">
          <p dangerouslySetInnerHTML={{ __html: t.markup('copyright', { year: new Date().getFullYear() }) }} />
        </footer>
      </div>
    </div>
  );
}
