
import { getOwnedBusiness } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building, Phone, Globe, MapPin, Clock, Star, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        ))}
    </div>
);

export default async function MyBusinessPage() {
    const business = await getOwnedBusiness();
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
                            No hemos podido encontrar un negocio asociado a tu cuenta. Por favor, contacta con soporte si crees que es un error.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }
    
    const photoUrls = business.photos?.map(photo => `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1000&key=${googleMapsApiKey}`) || [];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
                    <Building className="h-8 w-8 text-primary"/>
                    {business.name}
                </h1>
                <p className="text-muted-foreground">Este es el panel de control para tu negocio.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda (más ancha) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {photoUrls.length > 0 && googleMapsApiKey && (
                         <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ImageIcon/> Galería de Fotos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Carousel opts={{ loop: true }} className="w-full">
                                    <CarouselContent>
                                        {photoUrls.map((url, index) => (
                                            <CarouselItem key={index}>
                                                <div className="aspect-video relative rounded-lg overflow-hidden">
                                                    <Image src={url} alt={`${business.name} photo ${index + 1}`} fill className="object-cover"/>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="ml-14" />
                                    <CarouselNext className="mr-14" />
                                </Carousel>
                            </CardContent>
                         </Card>
                    )}

                     {business.topReviews && business.topReviews.length > 0 && (
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Star/> Reseñas Destacadas</CardTitle>
                                <CardDescription>Las mejores opiniones de tus clientes.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {business.topReviews.slice(0, 4).map((review, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-muted/50">
                                         <div className="flex items-center gap-3 mb-2">
                                            {review.profilePhotoUrl && <Image src={review.profilePhotoUrl} alt={review.authorName} width={40} height={40} className="rounded-full"/>}
                                            <div>
                                                <p className="font-semibold">{review.authorName}</p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                         </div>
                                         <p className="text-sm text-muted-foreground italic">"{review.text}"</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Columna Derecha */}
                <div className="flex flex-col gap-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Información del Negocio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start gap-3"><MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0"/><span className="text-muted-foreground">{business.address}</span></div>
                            {business.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary"/><span className="text-muted-foreground">{business.phone}</span></div>}
                            {business.website && <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-primary"/><a href={business.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors truncate">{business.website}</a></div>}
                        </CardContent>
                    </Card>
                    {business.openingHours?.weekdayDescriptions && (
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Clock/> Horario</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {business.openingHours.weekdayDescriptions.map((desc, i) => <li key={i}>{desc}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
