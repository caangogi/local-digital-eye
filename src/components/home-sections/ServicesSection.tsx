
"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Filter, Bot, AreaChart } from "lucide-react";
import Image from "next/image";

export function ServicesSection() {
    const t = useTranslations('LandingPage.services');

    const services = [
        {
            icon: <Filter className="h-6 w-6 text-primary" />,
            title: t('reviewFunnel.title'),
            description: t('reviewFunnel.description'),
            image: "https://picsum.photos/seed/funnel/400/300"
        },
        {
            icon: <Bot className="h-6 w-6 text-primary" />,
            title: t('aiResponder.title'),
            description: t('aiResponder.description'),
            image: "https://picsum.photos/seed/bot/400/300"
        },
        {
            icon: <AreaChart className="h-6 w-6 text-primary" />,
            title: t('seoReports.title'),
            description: t('seoReports.description'),
            image: "https://picsum.photos/seed/seo/400/300"
        },
    ];

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto">
                     <h2 className="text-3xl md:text-4xl font-bold mb-12">{t('title')}</h2>
                </div>
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <Card key={index} className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                             <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    data-ai-hint="abstract technology"
                                />
                             </div>
                             <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 bg-muted rounded-full">
                                    {service.icon}
                                </div>
                                <div>
                                    <CardTitle>{service.title}</CardTitle>
                                </div>
                             </CardHeader>
                             <CardContent>
                                <CardDescription>{service.description}</CardDescription>
                             </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
