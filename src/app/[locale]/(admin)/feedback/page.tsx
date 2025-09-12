
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listBusinessFeedback } from "@/actions/feedback.actions";
import { getOwnedBusiness } from "@/actions/business.actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MessageSquare, Star } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  // We'll create a new namespace for this page
  const t = await getTranslations('AppSidebar'); 
  return {
    title: `Feedback | ${t('dashboard')}`
  };
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        ))}
    </div>
);


export default async function FeedbackPage() {
    const business = await getOwnedBusiness();
    if (!business) {
        return (
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
        )
    }
    
    const feedbackItems = await listBusinessFeedback(business.id);

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Feedback de Clientes</h1>
                <p className="text-muted-foreground">Aquí puedes ver todas las opiniones y sugerencias que tus clientes han enviado de forma privada.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Bandeja de Entrada de Feedback</CardTitle>
                    <CardDescription>
                        {feedbackItems.length > 0 
                            ? `Has recibido ${feedbackItems.length} comentarios.`
                            : "Aún no has recibido ningún comentario privado."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {feedbackItems.length > 0 ? (
                        <div className="space-y-6">
                            {feedbackItems.map(item => (
                                <div key={item.id} className="border-b pb-6 last:border-b-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-4 mb-1">
                                                <StarRating rating={item.rating} />
                                                <p className="font-semibold">{item.userName || 'Anónimo'}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {format(item.createdAt, "PPP 'a las' p", { locale: es })} ({formatDistanceToNow(item.createdAt, { locale: es, addSuffix: true })})
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            {item.userEmail && <p>{item.userEmail}</p>}
                                            {item.userPhone && <p>{item.userPhone}</p>}
                                        </div>
                                    </div>
                                    <p className="mt-4 italic bg-muted/50 p-4 rounded-lg">"{item.comment}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-12">
                            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-lg font-medium">Todo en calma por aquí</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Cuando un cliente te deje un feedback privado con menos de 5 estrellas, aparecerá aquí.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
