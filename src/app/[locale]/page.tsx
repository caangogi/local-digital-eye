
import { Link } from "@/navigation";
import {useTranslations} from 'next-intl';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { HeroSection } from "@/components/home-sections/HeroSection";
import { ServicesSection } from "@/components/home-sections/ServicesSection";
import { PillarsSection } from "@/components/home-sections/PillarsSection";
import { PricingSection } from "@/components/home-sections/PricingSection";
import { ComparisonSection } from "@/components/home-sections/ComparisonSection";
import { CtaSection } from "@/components/home-sections/CtaSection";


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
        <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground group-hover:text-accent transition-colors">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
            </svg>
            <h1 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">{t('title')}</h1>
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
