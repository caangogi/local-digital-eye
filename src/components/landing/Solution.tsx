
"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Solution() {
    const t = useTranslations('Home.Solution');

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <motion.div 
                className="container mx-auto px-4 md:px-6 text-center max-w-4xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                    {t('title')}
                </h2>
                <p className="text-lg md:text-xl text-foreground/80">
                    {t('description')}
                </p>
            </motion.div>
        </section>
    );
}
