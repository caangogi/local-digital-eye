import { getTranslations } from "next-intl/server";
import { getOwnedBusiness } from "@/actions/business.actions";
import { BillingClientPage } from "./_components/BillingClientPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: `Facturación y Planes | ${t('settings')}`
  };
}

// This is now a SERVER COMPONENT responsible for data fetching
export default async function BillingPage() {
    const business = await getOwnedBusiness();
    
    // This case should ideally not happen for an 'owner' role, but it's a good safeguard.
    if (!business) {
        return (
             <div className="flex flex-col gap-6">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Facturación y Planes</h1>
                    <p className="text-muted-foreground">Gestiona tu suscripción y visualiza tus facturas.</p>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Negocio no encontrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                No se ha podido encontrar un negocio asociado a tu cuenta.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // We pass the fetched data to the client component that handles interaction
    return <BillingClientPage business={business} />;
}
