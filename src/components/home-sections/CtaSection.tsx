
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";

export function CtaSection() {
    const t = useTranslations('LandingPage');

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t('ctaTitle')}</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    {t('ctaSubtitle')}
                </p>
                <Link href="/login">
                     <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 rounded-lg text-base font-semibold px-8 py-3 shadow-lg hover:shadow-[0_0_25px_10px_hsl(var(--primary)/0.4)] transition-all duration-300"
                    >
                        {t('ctaButton')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
