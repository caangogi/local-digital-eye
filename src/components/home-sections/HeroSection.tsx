
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";

export function HeroSection() {
    const t = useTranslations('LandingPage');

    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6 text-center">
                 <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                    dangerouslySetInnerHTML={{ __html: t.markup('heroTitle', { accent: (chunks) => `<span class="text-accent">${chunks}</span>` }) }}
                />
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                    {t('heroSubtitle')}
                </p>
                <Link href="/login">
                    <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 rounded-lg text-base font-semibold px-8 py-3 shadow-lg hover:shadow-[0_0_25px_10px_hsl(var(--primary)/0.4)] transition-all duration-300"
                    >
                        {t('openDashboardButton')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
