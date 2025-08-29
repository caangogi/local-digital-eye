
import { getBusinessDetails } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ReviewForm } from "../../review/[businessId]/_components/ReviewForm";
import { Star, Phone, Globe, Clock, MapPin, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";


// Helper function to build the Google Photo URL
const getGooglePhotoUrl = (photoName: string, maxWidthPx = 800) => {
    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=${maxWidthPx}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
}

export default async function BusinessPublicProfilePage({ params }: { params: { businessId: string } }) {
    
    const business = await getBusinessDetails(params.businessId);

    if (!business) {
        notFound();
    }
    
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${business.placeId}`;
    
    const logoUrl = business.photos && business.photos.length > 0 
        ? getGooglePhotoUrl(business.photos[0].name, 200)
        : `https://picsum.photos/seed/${business.id}/100`;
    
    const hasPhotos = business.photos && business.photos.length > 0;

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="container mx-auto p-4 sm:p-8">
                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* Main Content Column */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Header Card with Carousel */}
                        <Card className="overflow-hidden shadow-lg">
                           {hasPhotos ? (
                                <Carousel className="w-full" opts={{ loop: true }}>
                                    <CarouselContent>
                                        {business.photos?.map((photo, index) => (
                                            <CarouselItem key={index}>
                                                <div className="h-64 md:h-80 bg-muted relative">
                                                    <Image
                                                        src={getGooglePhotoUrl(photo.name)}
                                                        alt={`${business.name} image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        priority={index === 0} // Prioritize loading the first image
                                                        data-ai-hint="business photo"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4 text-white bg-black/40 hover:bg-black/60 border-none" />
                                    <CarouselNext className="right-4 text-white bg-black/40 hover:bg-black/60 border-none" />
                                </Carousel>
                           ) : (
                             <div className="h-48 bg-gray-200 relative">
                                 <Image 
                                     src="https://picsum.photos/seed/cover/1200/400"
                                     alt={`${business.name} cover image`}
                                     fill
                                     className="object-cover"
                                     data-ai-hint="business cover"
                                 />
                             </div>
                           )}

                            <CardHeader className="relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-gradient-to-t from-card via-card/80 to-transparent pt-16 p-6">
                               <Image 
                                    src={logoUrl}
                                    alt={`Logo de ${business.name}`}
                                    width={100}
                                    height={100}
                                    className="rounded-full border-4 border-card shadow-lg bg-white object-cover"
                                    data-ai-hint="business logo"
                                />
                                <div className="flex-1">
                                    <Badge variant="secondary" className="mb-2 capitalize">{business.category?.replace(/_/g, ' ') || 'Negocio'}</Badge>
                                    <CardTitle className="text-3xl md:text-4xl font-headline">{business.name}</CardTitle>
                                    {business.address && <p className="text-sm text-muted-foreground mt-1">{business.address}</p>}
                                </div>
                            </CardHeader>
                        </Card>
                        
                        {/* Business Details Card - Moved to main column for better flow */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl"><Building className="text-primary"/> Información y Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {business.phone && (
                                     <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                                        <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                                    </div>
                                )}
                                {business.website && (
                                     <div className="flex items-start gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{business.website}</a>
                                    </div>
                                )}
                                {business.openingHours?.weekdayDescriptions && (
                                    <div className="flex items-start gap-3 pt-2">
                                        <Clock className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                                        <div className="flex-1">
                                             <p className={cn(
                                                "font-semibold mb-1",
                                                business.openingHours?.openNow ? "text-green-600" : "text-destructive"
                                             )}>
                                                {business.openingHours?.openNow ? 'Abierto ahora' : 'Cerrado ahora'}
                                            </p>
                                            <ul className="space-y-1 text-muted-foreground">
                                                {business.openingHours.weekdayDescriptions.map((day, i) => <li key={i}>{day}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter className="flex flex-wrap gap-2">
                                {business.phone && <Button asChild variant="outline"><a href={`tel:${business.phone}`}><Phone className="mr-2"/>Llamar ahora</a></Button>}
                                {business.website && <Button asChild variant="outline"><a href={business.website} target="_blank" rel="noopener noreferrer"><Globe className="mr-2"/>Sitio Web</a></Button>}
                                {business.gmbPageUrl && <Button asChild variant="outline"><a href={business.gmbPageUrl} target="_blank" rel="noopener noreferrer"><MapPin className="mr-2"/>Ver en Google Maps</a></Button>}
                            </CardFooter>
                        </Card>

                    </div>

                    {/* Sidebar Column - Now primarily for Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                         {/* Review Form Card - sticky for prominence */}
                        <Card className="shadow-lg lg:sticky lg:top-8" id="review-section">
                             <CardHeader>
                                <CardTitle className="text-2xl font-headline">Valora tu experiencia</CardTitle>
                                <CardDescription>Tu opinión es muy importante para nosotros y nos ayuda a mejorar cada día.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <ReviewForm business={business} />
                            </CardContent>
                        </Card>
                    </div>
                </main>
                 <footer className="text-center text-xs text-muted-foreground mt-12">
                    Potenciado por Local Digital Eye
                </footer>
            </div>
        </div>
    );
}
