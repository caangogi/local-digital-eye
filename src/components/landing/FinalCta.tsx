
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { motion } from "framer-motion";

export function FinalCta() {
    const t = useTranslations('Home.FinalCta');

    return (
        <motion.section 
            className="py-16 md:py-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t('title')}</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
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
            </div>
        </motion.section>
    );
}
