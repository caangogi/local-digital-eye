
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Rocket, CalendarDays, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ComparisonSection() {
    const t = useTranslations('Home.promotions');

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

                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Launch Offer Card */}
                    <Card className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-transparent transition-all duration-300 rounded-xl p-6 flex flex-col">
                        <CardHeader className="p-0 items-center text-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Rocket className="h-8 w-8 text-primary"/>
                            </div>
                            <CardTitle className="text-xl font-semibold">{t('launch.title')}</CardTitle>
                            <CardDescription className="text-muted-foreground mt-1">{t('launch.subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-6 flex-grow flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">{t('launch.profesional.title')}</h3>
                                    <p className="text-4xl font-bold my-1">{t('launch.profesional.price')}</p>
                                    <p className="text-xs text-muted-foreground">{t('launch.profesional.note')}</p>
                                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50">
                                        <strong>{t('launch.profesional.saving')}</strong>
                                    </Badge>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">{t('launch.premium.title')}</h3>
                                    <p className="text-4xl font-bold my-1">{t('launch.premium.price')}</p>
                                    <p className="text-xs text-muted-foreground">{t('launch.premium.note')}</p>
                                     <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50">
                                        <strong>{t('launch.premium.saving')}</strong>
                                    </Badge>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Button variant="outline" className="w-full">{t('launch.cta')}</Button>
                                <div className="text-left mt-6">
                                    <h4 className="font-semibold text-sm mb-2">{t('conditionsTitle')}</h4>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"/><span>{t('launch.conditions.c1')}</span></li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"/><span>{t('launch.conditions.c2')}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Annual Offer Card */}
                    <Card className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 border-primary transition-all duration-300 rounded-xl p-6 flex flex-col relative overflow-hidden">
                        <Badge className="absolute top-4 -right-12 rotate-45 px-12 py-1 bg-accent text-accent-foreground text-sm font-bold">{t('annual.badge')}</Badge>
                         <CardHeader className="p-0 items-center text-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <CalendarDays className="h-8 w-8 text-primary"/>
                            </div>
                            <CardTitle className="text-xl font-semibold">{t('annual.title')}</CardTitle>
                            <CardDescription className="text-muted-foreground mt-1">{t('annual.subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-6 flex-grow flex flex-col justify-between">
                             <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">{t('annual.plan.title')}</h3>
                                    <p className="text-5xl font-bold my-1 text-primary">{t('annual.plan.price')}</p>
                                    <p className="text-xs text-muted-foreground">{t('annual.plan.note')}</p>
                                    <div className="mt-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/50 border border-green-300/50">
                                        <h4 className="text-lg font-bold text-green-800 dark:text-green-200">{t('annual.plan.savingTitle')}</h4>
                                        <p className="text-xs text-green-700 dark:text-green-300">{t('annual.plan.savingDetail')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/40 transition-shadow">
                                    <Zap className="mr-2 h-4 w-4"/>{t('annual.cta')}
                                </Button>
                                <div className="text-left mt-6">
                                    <h4 className="font-semibold text-sm mb-2">{t('conditionsTitle')}</h4>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"/><span>{t('annual.conditions.c1')}</span></li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"/><span>{t('annual.conditions.c2')}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
