
"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers, Target, Radio, BrainCircuit } from "lucide-react";

export function PillarsSection() {
    const t = useTranslations('LandingPage.pillars');

    const pillars = [
        {
            icon: <Layers className="h-8 w-8 text-primary" />,
            title: t('p1.title'),
            description: t('p1.description'),
        },
        {
            icon: <Target className="h-8 w-8 text-primary" />,
            title: t('p2.title'),
            description: t('p2.description'),
        },
        {
            icon: <Radio className="h-8 w-8 text-primary" />,
            title: t('p3_legacy.title'),
            description: t('p3_legacy.description'),
        },
        {
            icon: <BrainCircuit className="h-8 w-8 text-primary" />,
            title: t('p4.title'),
            description: t('p4.description'),
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
                    <p className="text-lg text-muted-foreground mb-12">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((pillar, index) => (
                        <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary/50 border border-transparent transition-all duration-300 rounded-xl text-center p-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    {pillar.icon}
                                </div>
                            </div>
                            <CardHeader className="p-0">
                                <CardTitle className="text-xl font-semibold mb-2">{pillar.title}</CardTitle>
                                <CardDescription className="text-muted-foreground">{pillar.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
