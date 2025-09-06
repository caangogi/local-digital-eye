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

// This function needs to be in the client component as it uses an env var
// that is only available on the client.
const getGooglePhotoUrl = (photoName: string, maxWidthPx = 1200) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.warn("Google Maps API key is not configured for photo URLs.");
        return `https://picsum.photos/${maxWidthPx}/800`; // Fallback placeholder
    }
    // Using the legacy but still functional URL format for simplicity as v1 requires separate calls.
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidthPx}&photoreference=${photoName}&key=${apiKey}`;
};


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
                hidden: { opacity: 0, y: 50 },
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
    const hasValidLocation = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && business.location && typeof business.location.latitude === 'number' && typeof business.location.longitude === 'number';

    const ReviewFormCard = () => (
        <Card className="shadow-lg w-full max-w-md bg-card/90 backdrop-blur-sm border border-border/20">
            <CardHeader>
                <CardTitle className="text-xl font-headline">Valora tu experiencia</CardTitle>
                <CardDescription>Tu opinión es muy importante y nos ayuda a mejorar.</CardDescription>
            </CardHeader>
            <CardContent>
                <ReviewForm business={business} />
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[70vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white p-4">
                <div className="absolute inset-0 z-0">
                    {hasPhotos ? (
                        <Carousel className="w-full h-full" opts={{ loop: true }}>
                            <CarouselContent className="h-full">
                                {business.photos?.map((photo, index) => (
                                    <CarouselItem key={index} className="h-full">
                                        <div className="h-full w-full relative">
                                            <Image
                                                src={getGooglePhotoUrl(photo.name)}
                                                alt={`${business.name} image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="100vw"
                                                priority={index === 0}
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
                        <div className="h-full w-full bg-gray-200 relative">
                            <Image
                                src="https://picsum.photos/seed/cover/1200/800"
                                alt={`${business.name} cover image`}
                                fill
                                className="object-cover"
                                data-ai-hint="business cover"
                            />
                        </div>
                    )}
                     <div className="absolute inset-0 bg-black/50 z-10"></div>
                </div>

                <motion.div 
                  className="relative z-20 w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                    <ReviewFormCard />
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="py-12 md:py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <AnimatedSection>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                            {/* Business Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">{business.name}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-md text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="font-semibold">{business.rating}</span>
                                        <span>({business.reviewCount} reseñas)</span>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{business.category?.replace(/_/g, ' ') || 'Negocio'}</Badge>
                                </div>
                                <Separator />
                                <ul className="space-y-4 text-md">
                                    {business.address && (
                                        <li className="flex items-start gap-4">
                                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <span>{business.address}</span>
                                        </li>
                                    )}
                                    {business.phone && (
                                        <li className="flex items-start gap-4">
                                            <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                                        </li>
                                    )}
                                    {business.website && (
                                        <li className="flex items-start gap-4">
                                            <Globe className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{business.website}</a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            {/* Hours and Map */}
                            <div className="space-y-8">
                                 {business.openingHours?.weekdayDescriptions && (
                                    <Card className="bg-card">
                                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                            <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                                            <div>
                                                 <CardTitle className="text-lg font-semibold">Horario</CardTitle>
                                                 <p className={cn(
                                                    "font-bold text-sm",
                                                    business.openingHours?.openNow ? "text-green-600" : "text-destructive"
                                                )}>
                                                    {business.openingHours?.openNow ? 'Abierto ahora' : 'Cerrado ahora'}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="text-muted-foreground text-sm space-y-1">
                                                {business.openingHours.weekdayDescriptions.map((day, i) => <li key={i}>{day}</li>)}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                 )}
                                {hasValidLocation && (
                                    <div className="h-64 w-full rounded-lg overflow-hidden shadow-md">
                                        <iframe
                                            className="w-full h-full"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={mapEmbedUrl}>
                                        </iframe>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>
            
            <footer className="text-center text-xs text-muted-foreground py-6 bg-background">
                Potenciado por Local Digital Eye
            </footer>
        </div>
    );
}
