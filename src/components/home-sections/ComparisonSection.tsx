
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export function ComparisonSection() {
    const t = useTranslations('LandingPage.comparison');

    const comparisonData = [
        {
            concept: t('concept_salary'),
            traditional: '25.000 €',
            digital: 'N/A'
        },
        {
            concept: t('concept_social_security'),
            traditional: '8.000 €',
            digital: 'N/A'
        },
        {
            concept: t('concept_other'),
            traditional: '2.400 €',
            digital: 'N/A'
        },
        {
            concept: t('concept_management_fee'),
            traditional: 'N/A',
            digital: '5.988 €'
        },
        {
            concept: t('concept_ad_investment'),
            traditional: 'N/A',
            digital: '3.600 €'
        },
    ];

    const finalArguments = [
        t('argument_1'),
        t('argument_2'),
        t('argument_3'),
    ];

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto">
                     <h2 
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                        dangerouslySetInnerHTML={{ __html: t.markup('title', { accent: (chunks) => `<span class="text-accent">${chunks}</span>` }) }}
                    />
                    <p className="text-lg text-muted-foreground mb-12">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <Card className="shadow-lg bg-card/80">
                        <CardHeader>
                            <CardTitle>{t('header_traditional')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-3">
                                {comparisonData.map((item, index) => (
                                    item.traditional !== 'N/A' && (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>{item.concept}</span>
                                            <span className="font-semibold">{item.traditional}</span>
                                        </li>
                                    )
                                ))}
                            </ul>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>{t('total_cost')}</span>
                                    <span>~35.400 €</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-card/80 border-2 border-primary">
                        <CardHeader>
                            <CardTitle>{t('header_digital')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <ul className="space-y-3">
                                {comparisonData.map((item, index) => (
                                    item.digital !== 'N/A' && (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>{item.concept}</span>
                                            <span className="font-semibold">{item.digital}</span>
                                        </li>
                                    )
                                ))}
                            </ul>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between text-lg font-bold text-primary">
                                    <span>{t('total_cost')}</span>
                                    <span>9.588 €</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-16 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-6">{t('final_argument')}</h3>
                    <ul className="space-y-4">
                       {finalArguments.map((arg, index) => (
                           <li key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg shadow-sm">
                               <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                               <p className="text-muted-foreground">{arg}</p>
                           </li>
                       ))}
                    </ul>
                     <p className="text-center text-xl font-semibold mt-8 p-6 bg-accent/10 text-accent rounded-lg">
                        {t('conclusion')}
                    </p>
                </div>
            </div>
        </section>
    );
}
