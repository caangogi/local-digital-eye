
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
    const t = useTranslations('Home.Hero');

    return (
        <section className="relative py-24 md:py-40 text-center overflow-hidden">
            <div className="absolute inset-0 z-[-1] bg-muted/20">
                <Image
                    src="https://picsum.photos/seed/hero-bg/1920/1080"
                    alt="Professional working environment"
                    fill
                    className="object-cover opacity-10"
                    priority
                    data-ai-hint="professional office background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>

            <motion.div 
                className="container mx-auto px-4 md:px-6 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                 <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                >
                    {t('title')}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                    {t('subtitle')}
                </p>
                <Link href="/login">
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 rounded-lg text-base font-semibold px-8 py-3 shadow-lg hover:shadow-[0_0_25px_10px_hsl(var(--primary)/0.4)] transition-all duration-300"
                    >
                        {t('cta')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </motion.div>
        </section>
    );
}
