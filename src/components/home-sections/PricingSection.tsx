
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function PricingSection() {
    const t = useTranslations('LandingPage.pricing');

    const plans = [
        {
            title: t('setup.title'),
            price: t('setup.price'),
            period: t('setup.period'),
            description: t('setup.description'),
            isFeatured: false,
        },
        {
            title: t('management.title'),
            price: t('management.price'),
            period: t('management.period'),
            description: t('management.description'),
            isFeatured: true,
        },
        {
            title: t('ads.title'),
            price: t('ads.price'),
            period: t('ads.period'),
            description: t('ads.description'),
            isFeatured: false,
        },
    ];

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
                    <p className="text-lg text-muted-foreground mb-12">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${plan.isFeatured ? 'border-2 border-primary scale-105 bg-accent/5' : 'bg-card'}`}>
                            <CardHeader className="p-6">
                                <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                                <div className="flex items-baseline gap-2 mt-4">
                                     <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                     <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow p-6 pt-0">
                                <p className="text-muted-foreground">{plan.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
