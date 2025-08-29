
"use client";

import React, { useEffect, useRef } from 'react';
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "../../../review/[businessId]/_components/ReviewForm";
import { Phone, Globe, Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { motion, useAnimation, useInView } from "framer-motion";
import type { Business } from '@/backend/business/domain/business.entity';
import { getGooglePhotoUrl } from '../page';


interface BusinessPublicProfileViewProps {
    business: Business;
    mapEmbedUrl: string;
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

// This is the CLIENT COMPONENT responsible for UI and animations
export function BusinessPublicProfileView({ business, mapEmbedUrl }: BusinessPublicProfileViewProps) {
    
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