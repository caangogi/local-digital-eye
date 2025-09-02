
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Rocket, CalendarDays, Percent } from "lucide-react";

export function ComparisonSection() {
    const t = useTranslations('LandingPage.promotions');

    const offers = [
        {
            icon: <Rocket className="h-8 w-8 text-primary"/>,
            title: t('launch.title'),
            description: t('launch.description'),
            details: [
                t('launch.details.d1'),
                t('launch.details.d2')
            ],
            conditions: [
                t('launch.conditions.c1'),
                t('launch.conditions.c2')
            ]
        },
        {
            icon: <CalendarDays className="h-8 w-8 text-primary"/>,
            title: t('annual.title'),
            description: t('annual.description'),
            details: [
                t('annual.details.d1'),
            ],
            conditions: [
                // Inherits conditions from launch offer
            ]
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto">
                     <h2 
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-primary"
                    >
                        {t('title')}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-12">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {offers.map((offer, index) => (
                         <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-transparent transition-all duration-300 rounded-xl p-6 text-center flex flex-col">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    {offer.icon}
                                </div>
                            </div>
                            <CardHeader className="p-0">
                                <CardTitle className="text-xl font-semibold mb-2">{offer.title}</CardTitle>
                                <CardDescription className="text-muted-foreground">{offer.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 pt-6 flex-grow flex flex-col justify-between">
                                <ul className="space-y-2 text-left mb-6">
                                  {offer.details.map((detail, dIndex) => (
                                    <li key={dIndex} className="flex items-start gap-3">
                                        <Percent className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                                        <span dangerouslySetInnerHTML={{ __html: detail }} />
                                    </li>
                                  ))}
                                </ul>
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{t('conditionsTitle')}</h4>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        {offer.conditions.map((condition, cIndex) => (
                                            <li key={cIndex}>{condition}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <div className="mt-12 text-center p-4 bg-card rounded-lg">
                    <h3 className="text-lg font-semibold">{t('generalConditions.title')}</h3>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>{t('generalConditions.c1')}</li>
                        <li>{t('generalConditions.c2')}</li>
                        <li>{t('generalConditions.c3')}</li>
                    </ul>
                 </div>
            </div>
        </section>
    );
}
