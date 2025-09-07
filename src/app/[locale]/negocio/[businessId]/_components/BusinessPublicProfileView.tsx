
"use client";

import React from 'react';
import type { Business } from '@/backend/business/domain/business.entity';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { ReviewForm } from '@/app/[locale]/review/[businessId]/_components/ReviewForm';
import { Card } from '@/components/ui/card';
import { Map, Phone, Globe } from 'lucide-react';
import { Map as GoogleMap, APIProvider, Marker } from '@vis.gl/react-google-maps';

interface BusinessPublicProfileViewProps {
    business: Business;
    googleMapsApiKey: string | undefined;
}

export function BusinessPublicProfileView({ business, googleMapsApiKey }: BusinessPublicProfileViewProps) {
    const hasPhotos = business.photos && business.photos.length > 0;
    const defaultImage = "https://picsum.photos/seed/business-placeholder/1920/1080";

    // Create the LatLngLiteral object expected by the Google Maps components
    const mapCenter = business.location 
        ? { lat: business.location.latitude, lng: business.location.longitude }
        : null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Background Carousel */}
            <div className="absolute inset-0 z-[-1] overflow-hidden">
                <Carousel className="h-full w-full" opts={{ loop: true }}>
                    <CarouselContent className="h-full w-full">
                         {hasPhotos ? (
                            business.photos.map((photo, index) => (
                                <CarouselItem key={index} className="h-full w-full relative">
                                    <Image
                                        src={`https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1080&maxWidthPx=1920&key=${googleMapsApiKey}`}
                                        alt={`Foto de ${business.name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                </CarouselItem>
                            ))
                        ) : (
                             <CarouselItem className="h-full w-full relative">
                                <Image
                                    src={defaultImage}
                                    alt="Imagen de marcador de posición para el negocio"
                                    fill
                                    className="object-cover"
                                    priority
                                    data-ai-hint="placeholder image"
                                />
                            </CarouselItem>
                        )}
                    </CarouselContent>
                </Carousel>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                    {/* Left Column: Business Name */}
                    <div className="text-center md:text-left text-white">
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                            {business.name}
                        </h1>
                        <p className="mt-4 text-lg lg:text-xl text-slate-200">
                           {business.address}
                        </p>
                    </div>

                    {/* Right Column: Review Form */}
                    <div>
                         <Card className="bg-card/90 backdrop-blur-sm border-white/20 shadow-2xl">
                           <ReviewForm business={business} />
                        </Card>
                    </div>
                </div>
            </main>

             {/* Additional Info Section */}
             <section className="relative z-10 bg-background py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Ubicación y Horarios</h2>
                        <div className="space-y-4 text-muted-foreground">
                            {business.openingHours?.weekdayDescriptions && (
                                <ul className="space-y-1">
                                    {business.openingHours.weekdayDescriptions.map((line, i) => <li key={i}>{line}</li>)}
                                </ul>
                            )}
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4"/> {business.phone || 'Teléfono no disponible'}
                            </div>
                             <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4"/> <a href={business.website || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{business.website || 'Sitio web no disponible'}</a>
                            </div>
                        </div>
                    </div>
                    {googleMapsApiKey && mapCenter && (
                        <div className="h-80 w-full rounded-lg overflow-hidden border">
                            <APIProvider apiKey={googleMapsApiKey}>
                                <GoogleMap
                                    defaultCenter={mapCenter}
                                    defaultZoom={15}
                                    mapId="businessLocationMap"
                                    gestureHandling="cooperative"
                                >
                                    <Marker position={mapCenter} />
                                </GoogleMap>
                            </APIProvider>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}
