
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, ShieldCheck, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: `Facturación y Planes | ${t('settings')}`
  };
}

const plans = [
    {
        name: "Gratuito",
        price: "€0",
        priceDescription: "para siempre",
        features: [
            "Gestión básica de perfil",
            "Hasta 10 respuestas a reseñas con IA / mes",
            "Informes de rendimiento semanales",
        ],
        isCurrent: true,
        cta: "Plan Actual"
    },
    {
        name: "Profesional",
        price: "€49",
        priceDescription: "por mes",
        features: [
            "Todo lo del plan Gratuito",
            "Respuestas ilimitadas con IA a reseñas",
            "Publicaciones automáticas en GMB",
            "Monitorización de palabras clave",
            "Soporte prioritario por email"
        ],
        isCurrent: false,
        cta: "Actualizar Plan",
        isRecommended: true
    },
    {
        name: "Premium",
        price: "€99",
        priceDescription: "por mes",
        features: [
            "Todo lo del plan Profesional",
            "Análisis avanzado de competidores",
            "Creación de Microsite SEO",
            "Gestor de cuenta dedicado",
            "Soporte por teléfono y videollamada"
        ],
        isCurrent: false,
        cta: "Actualizar Plan",
    }
]

export default function BillingPage() {
    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Facturación y Planes</h1>
                <p className="text-muted-foreground">Gestiona tu suscripción y visualiza tus facturas.</p>
            </div>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
               {plans.map(plan => (
                 <Card 
                    key={plan.name}
                    className={cn(
                        "flex flex-col shadow-md hover:shadow-xl transition-all duration-300",
                        plan.isRecommended && "border-2 border-primary shadow-primary/20"
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
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                           </li> 
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full" 
                            disabled={plan.isCurrent}
                            variant={plan.isRecommended ? "default" : "outline"}
                        >
                            {plan.isCurrent ? <ShieldCheck className="mr-2 h-4 w-4"/> : <Star className="mr-2 h-4 w-4"/>}
                            {plan.cta}
                        </Button>
                    </CardFooter>
                 </Card>
               ))}
            </section>
        </div>
    )
}
