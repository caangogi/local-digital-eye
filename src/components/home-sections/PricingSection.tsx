
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
    const t = useTranslations('Home.plans');

    const features = [
        {
            name: t('features.gmb'),
            esencial: true,
            profesional: true,
            premium: true
        },
        {
            name: t('features.reputation'),
            esencial: false,
            profesional: true,
            premium: true
        },
        {
            name: t('features.microsite'),
            esencial: false,
            profesional: false,
            premium: true
        }
    ];

    const plans = [
        {
            name: t('esencial.title'),
            isRecommended: false,
            setupPrice: t('esencial.setupPrice'),
            monthlyPrice: t('esencial.monthlyPrice'),
        },
        {
            name: t('profesional.title'),
            isRecommended: true,
            setupPrice: t.markup('profesional.setupPrice'),
            monthlyPrice: t.markup('profesional.monthlyPrice'),
        },
        {
            name: t('premium.title'),
            isRecommended: false,
            setupPrice: t.markup('premium.setupPrice'),
            monthlyPrice: t.markup('premium.monthlyPrice'),
        }
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
                
                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                            <div className="text-lg font-semibold">{t('featureHeader')}</div>
                            {plans.map((plan, index) => (
                                <div key={index} className="text-center font-semibold p-2 rounded-lg">
                                    <h3 className="text-lg">{plan.name}</h3>
                                    {plan.isRecommended && <Badge variant="default" className="mt-1 bg-accent hover:bg-accent/90">{t('recommended')}</Badge>}
                                </div>
                            ))}
                        </div>

                        {features.map((feature, fIndex) => (
                            <div key={fIndex} className="grid grid-cols-4 gap-4 items-center py-4 border-b">
                                <div>{feature.name}</div>
                                <div className="text-center">{feature.esencial ? <Check className="h-6 w-6 text-green-500 mx-auto"/> : <X className="h-6 w-6 text-muted-foreground mx-auto"/>}</div>
                                <div className="text-center">{feature.profesional ? <Check className="h-6 w-6 text-green-500 mx-auto"/> : <X className="h-6 w-6 text-muted-foreground mx-auto"/>}</div>
                                <div className="text-center">{feature.premium ? <Check className="h-6 w-6 text-green-500 mx-auto"/> : <X className="h-6 w-6 text-muted-foreground mx-auto"/>}</div>
                            </div>
                        ))}
                        
                        <div className="grid grid-cols-4 gap-4 items-center py-4 border-b font-bold">
                            <div>{t('setupHeader')}</div>
                            <div className="text-center">{plans[0].setupPrice}</div>
                            <div className="text-center" dangerouslySetInnerHTML={{ __html: plans[1].setupPrice as string }} />
                            <div className="text-center" dangerouslySetInnerHTML={{ __html: plans[2].setupPrice as string }} />
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 items-center py-4 border-b font-bold">
                            <div>{t('monthlyHeader')}</div>
                            <div className="text-center">{plans[0].monthlyPrice}</div>
                            <div className="text-center" dangerouslySetInnerHTML={{ __html: plans[1].monthlyPrice as string }} />
                            <div className="text-center" dangerouslySetInnerHTML={{ __html: plans[2].monthlyPrice as string }} />
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 items-center pt-6">
                            <div></div>
                            {plans.map((plan, index) => (
                                <div key={index} className="text-center">
                                    <Button className="w-full max-w-xs mx-auto">{t('ctaButton')}</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
