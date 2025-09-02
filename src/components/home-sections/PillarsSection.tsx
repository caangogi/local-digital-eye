
"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Rocket, CalendarDays, TrendingUp, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export function PillarsSection() {
    const t = useTranslations('Home.detailedServices');

    const services = [
        {
            icon: <TrendingUp className="h-10 w-10 text-blue-600" />,
            title: t('gmb.title'),
            headerColor: "bg-blue-50 dark:bg-blue-900/20",
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
            icon: <ShieldCheck className="h-10 w-10 text-green-600" />,
            title: t('reputation.title'),
            headerColor: "bg-green-50 dark:bg-green-900/20",
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
            icon: <Rocket className="h-10 w-10 text-amber-600" />,
            title: t('microsite.title'),
            headerColor: "bg-amber-50 dark:bg-amber-900/20",
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
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {services.map((service, index) => (
                        <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary/50 border border-transparent transition-all duration-300 rounded-xl flex flex-col">
                             <CardHeader className={cn("p-6 text-center items-center rounded-t-xl", service.headerColor)}>
                                {service.icon}
                                <CardTitle className="text-xl font-semibold mt-4 h-16">{service.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                     <Badge variant="default" className="text-sm py-1 px-3">{t('setupLabel')}: <b className="ml-1">{service.setupPrice}</b></Badge>
                                     <Badge variant="outline" className="text-sm py-1 px-3">{t('monthlyLabel')}: <b className="ml-1">{service.monthlyPrice}</b></Badge>
                                </div>
                                <Separator className="my-6" />
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                                            <Rocket className="h-5 w-5 text-accent" />
                                            {t('setupFeaturesLabel')}
                                        </h4>
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
                                        <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5 text-accent"/>
                                            {t('monthlyFeaturesLabel')}
                                        </h4>
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
                             <CardFooter className="p-6 mt-auto">
                                <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-300">{t('ctaButton')}</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
