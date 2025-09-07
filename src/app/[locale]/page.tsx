
import { Link as IntlLink } from "@/navigation";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import Image from "next/image";
import Link from 'next/link';

// New Landing Page Sections
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Results } from "@/components/landing/Results";
import { FinalCta } from "@/components/landing/FinalCta";

// Existing Sections to be re-integrated
import { PillarsSection } from "@/components/home-sections/PillarsSection";
import { PricingSection } from "@/components/home-sections/PricingSection";
import { ComparisonSection } from "@/components/home-sections/ComparisonSection";
import { Button } from "@/components/ui/button";


export default function LandingPage() {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-[#72b9ff69] backdrop-blur-lg py-3">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 flex justify-between items-center">
          <IntlLink href="/" className="flex items-center gap-2 group">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/consultoria-e8a9c.appspot.com/o/Images%2Flogo-consultoria.png?alt=media&token=c270a057-36ab-443c-b1cd-c98495cad4b7"
              alt="ConsultorIA Logo"
              width={150}
              height={40}
              priority
            />
          </IntlLink>
          <nav className="flex items-center gap-2">
            <Link href="/dev/my-bussiness-road-map">
              <Button variant="outline" size="sm">Roadmap</Button>
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto">
        <main className="flex-grow">
          <Hero />
          <Problem />
          <Solution />
          <HowItWorks />
          <Results />

          {/* Re-integrating existing pricing sections */}
          <PillarsSection />
          <PricingSection />
          <ComparisonSection />

          <FinalCta />
        </main>

        <footer className="py-8 text-center text-muted-foreground border-t border-border/30">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <p dangerouslySetInnerHTML={{ __html: t.markup('copyright', { year: new Date().getFullYear() }) }} />
          </div>
        </footer>
      </div>
    </div>
  );
}

    