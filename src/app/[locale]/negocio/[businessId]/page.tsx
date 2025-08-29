
"use client";

import { useEffect, useRef } from 'react';
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
import { motion, useAnimation, useInView } from "framer-motion";
import type { Business } from '@/backend/business/domain/business.entity';


// Helper function to build the Google Photo URL
const getGooglePhotoUrl = (photoName: string, maxWidthPx = 800) => {
    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=${maxWidthPx}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
}

// Reusable component for animated sections
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            variants={{
                hidden: { opacity: 0, y: 75 },
                visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ duration: 0.7, delay: 0.25 }}
        >
            {children}
        </motion.div>
    );
};

// We must fetch data in a server component and pass it down
// This is a pattern for using client components with async data
export default function BusinessPublicProfilePageWrapper({ params }: { params: { businessId: string } }) {
    // This part remains a Server Component to fetch data
    // In a real implementation, you would fetch data here and pass it to the client component.
    // For now, we pass the params and the component will fetch inside a useEffect (not ideal, but works for this structure)
    return <BusinessPublicProfileClientPage params={params} />;
}


function BusinessPublicProfileClientPage({ params }: { params: { businessId: string } }) {
    
    // State management for business data
    const [business, setBusiness] = React.useState<Business | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        const fetchBusiness = async () => {
            setIsLoading(true);
            const businessDetails = await getBusinessDetails(params.businessId);
            if (!businessDetails) {
                notFound();
            }
            setBusiness(businessDetails);
            setIsLoading(false);
        };
        fetchBusiness();
    }, [params.businessId]);


    if (isLoading || !business) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-pulse">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
                <p className="text-muted-foreground">Cargando perfil del negocio...</p>
                </div>
            </div>
        );
    }
    
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${business.placeId}`;
    
    const hasPhotos = business.photos && business.photos.length > 0;

    const BusinessInfoCard = () => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
      </motion.div>
    );

    const ReviewCard = () => (
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Card className="shadow-lg">
           <CardHeader>
              <CardTitle className="text-xl font-headline">Valora tu experiencia</CardTitle>
              <CardDescription>Tu opinión es muy importante y nos ayuda a mejorar.</CardDescription>
          </CardHeader>
          <CardContent>
             <ReviewForm business={business} />
          </CardContent>
        </Card>
      </motion.div>
    );
    
    const MapView = () => (
         <motion.div className="h-96 md:h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.4 }}>
            <iframe
                className="rounded-lg shadow-lg w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedUrl}>
            </iframe>
         </motion.div>
    );
    
    const ReviewCtaSection = () => (
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                 <AnimatedSection>
                    <div className="max-w-2xl mx-auto">
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
                </AnimatedSection>
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
