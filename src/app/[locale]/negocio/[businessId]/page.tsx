
import { getBusinessDetails } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ReviewForm } from "../../review/[businessId]/_components/ReviewForm";
import { Phone, Globe, Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";


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
    
    const hasPhotos = business.photos && business.photos.length > 0;

    const BusinessInfoCard = () => (
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Card className="overflow-hidden shadow-lg w-full">
           {hasPhotos ? (
                <Carousel className="w-full" opts={{ loop: true }}>
                    <CarouselContent>
                        {business.photos?.map((photo, index) => (
                            <CarouselItem key={index}>
                                <div className="h-56 bg-muted relative">
                                    <Image
                                        src={getGooglePhotoUrl(photo.name)}
                                        alt={`${business.name} image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={index === 0}
                                        data-ai-hint="business photo"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 text-white bg-black/40 hover:bg-black/60 border-none" />
                    <CarouselNext className="right-2 text-white bg-black/40 hover:bg-black/60 border-none" />
                </Carousel>
           ) : (
             <div className="h-48 bg-gray-200 relative">
                 <Image 
                     src="https://picsum.photos/seed/cover/800/300"
                     alt={`${business.name} cover image`}
                     fill
                     className="object-cover"
                     data-ai-hint="business cover"
                 />
             </div>
           )}

            <CardHeader className="p-4">
                <CardTitle className="text-2xl font-headline">{business.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                    <span>{business.rating}</span>
                    <span>({business.reviewCount} reseñas)</span>
                </div>
                <Badge variant="secondary" className="capitalize w-fit">{business.category?.replace(/_/g, ' ') || 'Negocio'}</Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <Separator />
                <ul className="space-y-4 text-sm mt-4">
                    {business.address && (
                        <li className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                            <span>{business.address}</span>
                        </li>
                    )}
                    {business.openingHours?.weekdayDescriptions && (
                        <li className="flex items-start gap-4">
                            <Clock className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className={cn(
                                    "font-semibold",
                                    business.openingHours?.openNow ? "text-green-600" : "text-destructive"
                                )}>
                                    {business.openingHours?.openNow ? 'Abierto ahora' : 'Cerrado ahora'}
                                </p>
                                <ul className="text-muted-foreground text-xs">
                                    {business.openingHours.weekdayDescriptions.map((day, i) => <li key={i}>{day}</li>)}
                                </ul>
                            </div>
                        </li>
                    )}
                     {business.website && (
                        <li className="flex items-start gap-4">
                            <Globe className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{business.website}</a>
                        </li>
                    )}
                    {business.phone && (
                        <li className="flex items-start gap-4">
                            <Phone className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                            <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                        </li>
                    )}
                </ul>
            </CardContent>
        </Card>
      </div>
    );

    const ReviewCard = () => (
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Card className="shadow-lg">
           <CardHeader>
              <CardTitle className="text-xl font-headline">Valora tu experiencia</CardTitle>
              <CardDescription>Tu opinión es muy importante y nos ayuda a mejorar.</CardDescription>
          </CardHeader>
          <CardContent>
             <ReviewForm business={business} />
          </CardContent>
        </Card>
      </div>
    );
    
    const MapView = () => (
         <div className="h-96 md:h-full w-full animate-in fade-in duration-500">
            <iframe
                className="rounded-lg shadow-lg w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedUrl}>
            </iframe>
         </div>
    );
    
    const ReviewCtaSection = () => (
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <Card className="shadow-2xl border-2 border-primary/50 bg-card/80">
                        <CardHeader className="text-center">
                            <Star className="mx-auto h-12 w-12 text-yellow-400 mb-4"/>
                            <CardTitle className="text-2xl md:text-3xl font-headline text-primary">¿Ya tienes una opinión sobre {business.name}?</CardTitle>
                            <CardDescription className="text-lg">¡No te la guardes! Tu feedback es el motor de nuestro crecimiento.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReviewForm business={business}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );


    return (
        <div className="min-h-screen bg-muted/20">
            <main className="container mx-auto p-4 h-full">
                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col gap-6">
                    <ReviewCard />
                    <BusinessInfoCard />
                    <MapView />
                </div>

                {/* Desktop Layout */}
                 <div className="hidden md:grid md:grid-cols-12 md:gap-8 h-full">
                    {/* Left Column: Business Info */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-6">
                        <BusinessInfoCard />
                    </div>

                    {/* Right Column: Map with floating Review Card */}
                    <div className="md:col-span-7 lg:col-span-8 h-full relative">
                        <div className="h-full min-h-[calc(100vh-2rem)] w-full sticky top-4">
                            <MapView />
                            <div className="absolute top-4 right-4 z-10 w-full sm:max-w-md">
                                <ReviewCard />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <ReviewCtaSection />
            
            <footer className="text-center text-xs text-muted-foreground py-4">
                Potenciado por Local Digital Eye
            </footer>
        </div>
    );
}
