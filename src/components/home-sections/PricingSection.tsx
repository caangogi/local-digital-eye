
"use client";

import { useTranslations } from "next-intl";
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
            setupPrice: { new: t('prices.esencial.setup') },
            monthlyPrice: { new: t('prices.esencial.monthly') },
        },
        {
            name: t('profesional.title'),
            isRecommended: true,
            setupPrice: {
                old: t('prices.profesional.setupOld'),
                new: t('prices.profesional.setupNew'),
                saving: t('prices.profesional.setupSaving'),
            },
            monthlyPrice: {
                old: t('prices.profesional.monthlyOld'),
                new: t('prices.profesional.monthlyNew'),
                saving: t('prices.profesional.monthlySaving'),
            },
        },
        {
            name: t('premium.title'),
            isRecommended: false,
            setupPrice: {
                old: t('prices.premium.setupOld'),
                new: t('prices.premium.setupNew'),
                saving: t('prices.premium.setupSaving'),
            },
            monthlyPrice: {
                old: t('prices.premium.monthlyOld'),
                new: t('prices.premium.monthlyNew'),
                saving: t('prices.premium.monthlySaving'),
            },
        }
    ];

    const PriceDisplay = ({ price }: { price: { old?: string; new: string; saving?: string } }) => {
        if (price.old) {
            return (
                <>
                    <span className="line-through text-muted-foreground">{price.old}</span>
                    <br />
                    <b>{price.new}</b>
                    <br />
                    <span className="text-green-600 font-semibold">{price.saving}</span>
                </>
            );
        }
        return <b>{price.new}</b>;
    };

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
                            {plans.map((plan, index) => (
                                <div key={index} className="text-center text-sm leading-tight">
                                    <PriceDisplay price={plan.setupPrice} />
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 items-center py-4 border-b font-bold">
                            <div>{t('monthlyHeader')}</div>
                             {plans.map((plan, index) => (
                                <div key={index} className="text-center text-sm leading-tight">
                                    <PriceDisplay price={plan.monthlyPrice} />
                                </div>
                            ))}
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
