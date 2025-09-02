
"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PillarsSection() {
    const t = useTranslations('LandingPage.detailedServices');

    const services = [
        {
            title: t('gmb.title'),
            setupPrice: t('gmb.setupPrice'),
            monthlyPrice: t('gmb.monthlyPrice'),
            setupFeatures: [
                t('gmb.setupFeatures.f1'),
                t('gmb.setupFeatures.f2'),
                t('gmb.setupFeatures.f3'),
                t('gmb.setupFeatures.f4'),
            ],
            monthlyFeatures: [
                t('gmb.monthlyFeatures.f1'),
                t('gmb.monthlyFeatures.f2'),
                t('gmb.monthlyFeatures.f3'),
                t('gmb.monthlyFeatures.f4'),
                t('gmb.monthlyFeatures.f5'),
            ]
        },
        {
            title: t('reputation.title'),
            setupPrice: t('reputation.setupPrice'),
            monthlyPrice: t('reputation.monthlyPrice'),
            setupFeatures: [
                t('reputation.setupFeatures.f1'),
                t('reputation.setupFeatures.f2'),
                t('reputation.setupFeatures.f3'),
            ],
            monthlyFeatures: [
                t('reputation.monthlyFeatures.f1'),
                t('reputation.monthlyFeatures.f2'),
                t('reputation.monthlyFeatures.f3'),
            ]
        },
        {
            title: t('microsite.title'),
            setupPrice: t('microsite.setupPrice'),
            monthlyPrice: t('microsite.monthlyPrice'),
            setupFeatures: [
                t('microsite.setupFeatures.f1'),
                t('microsite.setupFeatures.f2'),
                t('microsite.setupFeatures.f3'),
                t('microsite.setupFeatures.f4'),
            ],
            monthlyFeatures: [
                t('microsite.monthlyFeatures.f1'),
                t('microsite.monthlyFeatures.f2'),
                t('microsite.monthlyFeatures.f3'),
            ]
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
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {services.map((service, index) => (
                        <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary/50 border border-transparent transition-all duration-300 rounded-xl p-4 h-full flex flex-col">
                            <CardHeader className="p-2">
                                <CardTitle className="text-xl font-semibold mb-2">{service.title}</CardTitle>
                                <div className="flex gap-4">
                                     <Badge variant="outline">{t('setupLabel')}: <span className="font-bold ml-1">{service.setupPrice}</span></Badge>
                                     <Badge variant="outline">{t('monthlyLabel')}: <span className="font-bold ml-1">{service.monthlyPrice}</span></Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-2 flex-grow">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">{t('setupFeaturesLabel')}</h4>
                                        <ul className="space-y-2">
                                            {service.setupFeatures.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">{t('monthlyFeaturesLabel')}</h4>
                                        <ul className="space-y-2">
                                            {service.monthlyFeatures.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
