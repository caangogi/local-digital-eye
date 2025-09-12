
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, ShieldCheck, Star, Settings, Loader2, Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Business } from '@/backend/business/domain/business.entity';
import { createStripePortalSession } from '@/actions/stripe.actions';
import { useToast } from '@/hooks/use-toast';

interface BillingClientPageProps {
    business: Business;
}

const plans = [
    {
        id: "freemium",
        name: "Gratuito",
        price: "€0",
        priceDescription: "para empezar",
        features: [
            "Gestión básica de perfil",
            "Funnel de Perfil Público (Filtro de reseñas)",
            "Generación de QR para pedir reseñas",
            "Informes de rendimiento semanales",
        ],
        cta: "Plan Actual"
    },
    {
        id: "professional",
        name: "Profesional",
        price: "€97",
        priceDescription: "por mes",
        features: [
            "Todo lo del plan Gratuito",
            "Monitorización de palabras clave",
            "Publicaciones manuales en GMB",
            "Soporte prioritario por email"
        ],
        cta: "Actualizar Plan",
        isRecommended: true
    },
    {
        id: "premium",
        name: "Premium",
        price: "€197",
        priceDescription: "por mes",
        features: [
            "Todo lo del plan Profesional",
            "Respuestas ilimitadas con IA a reseñas",
            "Publicaciones automáticas en GMB (con IA)",
            "Análisis avanzado de competidores (con IA)",
            "Creación y mantenimiento de Microsite SEO",
            "Gestor de cuenta dedicado",
        ],
        cta: "Actualizar Plan",
    }
];

const statusLabels: { [key: string]: string } = {
    trialing: 'En Periodo de Prueba',
    active: 'Activa',
    past_due: 'Pago Vencido',
    canceled: 'Cancelada',
    unpaid: 'Sin Pagar',
    pending_payment: 'Pago Pendiente'
}
const statusColors: { [key: string]: string } = {
    trialing: 'bg-blue-500',
    active: 'bg-green-500',
    past_due: 'bg-yellow-500',
    canceled: 'bg-red-500',
    unpaid: 'bg-red-500',
    pending_payment: 'bg-orange-500'
}


export function BillingClientPage({ business }: BillingClientPageProps) {
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const { toast } = useToast();
    
    const currentPlanId = business.subscriptionPlan || 'freemium';

    const handleManageSubscription = async () => {
        if (!business.stripeCustomerId) {
            toast({
                title: "Error",
                description: "No se ha encontrado información de cliente de Stripe para este negocio.",
                variant: "destructive",
            });
            return;
        }

        setIsPortalLoading(true);
        try {
            const response = await createStripePortalSession(business.stripeCustomerId);
            
            if (response.url) {
                window.location.href = response.url;
            } else {
                throw new Error(response.error || "No se pudo abrir el portal de gestión de suscripción. Por favor, inténtalo de nuevo.");
            }

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            setIsPortalLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Facturación y Planes</h1>
                <p className="text-muted-foreground">Gestiona tu suscripción y visualiza tus facturas.</p>
            </div>

            {business.stripeCustomerId && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Suscripción</CardTitle>
                        <CardDescription>Visualiza tus facturas, actualiza tu método de pago o cancela tu suscripción en cualquier momento.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold text-lg">Tu Plan Actual: <span className="text-primary">{plans.find(p => p.id === currentPlanId)?.name || 'Desconocido'}</span></p>
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <span>Estado:</span>
                                <span className={cn("px-2 py-0.5 text-xs font-semibold text-white rounded-full", statusColors[business.subscriptionStatus || ''] || 'bg-gray-500')}>
                                    {statusLabels[business.subscriptionStatus || ''] || 'Desconocido'}
                                </span>
                            </div>
                        </div>
                        <Button onClick={handleManageSubscription} disabled={isPortalLoading}>
                            {isPortalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Settings className="mr-2 h-4 w-4" />}
                            Gestionar mi Suscripción
                        </Button>
                    </CardContent>
                </Card>
            )}
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
               {plans.map(plan => (
                 <Card 
                    key={plan.id}
                    className={cn(
                        "flex flex-col shadow-md hover:shadow-xl transition-all duration-300",
                        plan.isRecommended && "border-2 border-primary shadow-primary/20",
                        currentPlanId === plan.id && "bg-muted/30"
                    )}
                 >
                    {plan.isRecommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recomendado</Badge>
                    )}
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{plan.name}</CardTitle>
                        <CardDescription>
                            <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                            <span className="text-muted-foreground">/{plan.priceDescription}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <ul className="space-y-3">
                        {plan.features.map(feature => (
                           <li key={feature} className="flex items-start gap-2 text-sm">
                                {feature.toLowerCase().includes('ia') ? 
                                    <Cpu className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" /> : 
                                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                }
                                <span className="text-muted-foreground">{feature}</span>
                           </li> 
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                         <Button 
                            className="w-full" 
                            disabled={currentPlanId === plan.id}
                            variant={currentPlanId === plan.id ? "outline" : (plan.isRecommended ? "default" : "secondary")}
                        >
                            {currentPlanId === plan.id ? <ShieldCheck className="mr-2 h-4 w-4"/> : <Zap className="mr-2 h-4 w-4"/>}
                            {currentPlanId === plan.id ? 'Plan Actual' : plan.cta}
                        </Button>
                    </CardFooter>
                 </Card>
               ))}
            </section>
        </div>
    )
}
