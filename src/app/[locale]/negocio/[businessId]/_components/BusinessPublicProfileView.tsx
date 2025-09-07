"use client";

import React from 'react';
import type { Business } from '@/backend/business/domain/business.entity';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { ReviewForm } from '@/app/[locale]/review/[businessId]/_components/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, Phone, Globe, Star } from 'lucide-react';
import { Map as GoogleMap, APIProvider, Marker } from '@vis.gl/react-google-maps';

// Tipos para las props
interface BusinessPublicProfileViewProps {
    business: Business;
    googleMapsApiKey: string | undefined;
}

interface TopReviewsProps {
    reviews: Business['topReviews'];
}

// Componente interno para el carrusel de fondo
const BackgroundImageCarousel = ({ business, googleMapsApiKey }: BusinessPublicProfileViewProps) => {
    const hasPhotos = business.photos && business.photos.length > 0;
    const defaultImage = "https://picsum.photos/seed/business-placeholder/1920/1080"; // Imagen por defecto

    return (
        <div className="absolute top-0 left-0 h-screen w-screen -z-10">
            <Carousel className="h-full w-full" opts={{ loop: true }}>
                <CarouselContent className="h-full">
                    {hasPhotos ? (
                        business.photos.map((photo, index) => (
                            <CarouselItem key={index} className="relative h-full w-full">
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
                        <CarouselItem className="relative h-full w-full">
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"></div>
        </div>
    );
};

// Componente para mostrar las estrellas de valoración
const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);


// Componente para la sección de "Top Reviews"
const TopReviewsSection = ({ reviews }: TopReviewsProps) => {
    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="bg-background py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                        La opinión de nuestros clientes
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Valoramos cada comentario. Tu opinión nos ayuda a mejorar cada día.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.slice(0, 3).map((review, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                {review.profilePhotoUrl && (
                                     <Image src={review.profilePhotoUrl} alt={review.authorName} width={48} height={48} className="rounded-full" />
                                )}
                                <div>
                                    <CardTitle className="text-lg">{review.authorName}</CardTitle>
                                    <StarRating rating={review.rating} className="mt-1" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">"{review.text}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};


// Componente principal de la Landing Page
export function BusinessPublicProfileView({ business, googleMapsApiKey }: BusinessPublicProfileViewProps) {
    const center = business.location
        ? { lat: business.location.latitude, lng: business.location.longitude }
        : null;

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="relative isolate">
                <BackgroundImageCarousel business={business} googleMapsApiKey={googleMapsApiKey} />

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 text-white">
                    <div className="max-w-2xl w-full">
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                           ¡Gracias por confiar en {business.name}!
                        </h1>
                        <p className="mt-4 text-lg lg:text-xl text-slate-200" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                           Tu opinión es muy importante para nosotros. Por favor, déjanos una reseña.
                        </p>
                        
                        <Card className="mt-8 bg-card/80 backdrop-blur-md border-white/20 shadow-2xl w-full">
                            <ReviewForm business={business} />
                        </Card>
                    </div>
                </main>
            </div>

            {/* Top Reviews Section */}
            <TopReviewsSection reviews={business.topReviews} />

            {/* Additional Info Section */}
            <section className="bg-secondary/50 py-20 md:py-28">
                <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Contacto y Ubicación</h2>
                        <div className="space-y-4 text-muted-foreground text-lg">
                             <div className="flex items-start gap-3">
                                <MapIcon className="h-6 w-6 mt-1 text-primary"/> 
                                <span>{business.address}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-6 w-6 text-primary"/> 
                                <span>{business.phone || 'Teléfono no disponible'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-6 w-6 text-primary"/> 
                                <a href={business.website || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    {business.website || 'Sitio web no disponible'}
                                </a>
                            </div>
                        </div>
                    </div>
                    {googleMapsApiKey && center && (
                        <div className="h-96 w-full rounded-lg overflow-hidden border-4 border-white/10 shadow-xl">
                            <APIProvider apiKey={googleMapsApiKey}>
                                <GoogleMap
                                    defaultCenter={center}
                                    defaultZoom={15}
                                    mapId="businessLocationMap"
                                    gestureHandling="cooperative"
                                >
                                    <Marker position={center} />
                                </GoogleMap>
                            </APIProvider>
                        </div>
                    )}
                </div>
            </section>
             <footer className="bg-background py-6">
                <div className="container mx-auto text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {business.name}. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}