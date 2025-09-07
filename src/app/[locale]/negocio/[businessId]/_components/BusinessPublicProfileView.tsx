
"use client";

import React from 'react';
import type { Business } from '@/backend/business/domain/business.entity';
import { ReviewForm } from '@/app/[locale]/review/[businessId]/_components/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map as MapIcon, Phone, Globe, Star, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { Map as GoogleMap, APIProvider, Marker } from '@vis.gl/react-google-maps';
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

// Tipos para las props
interface BusinessPublicProfileViewProps {
    business: Business;
    googleMapsApiKey: string | undefined;
}
interface TopReviewsProps {
    reviews: Business['topReviews'];
}
interface PhotoCarouselProps {
    business: Business;
    googleMapsApiKey: string | undefined;
}


// --- Componente principal de la Landing Page ---
export function BusinessPublicProfileView({ business, googleMapsApiKey }: BusinessPublicProfileViewProps) {
    const center = business.location ? { lat: business.location.latitude, lng: business.location.longitude } : null;

    return (
        <div className="bg-background text-foreground min-h-screen isolate">
            {/* Aurora Background Effect - more prominent in dark mode */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-10 dark:opacity-15"
                    style={{
                        background: 'radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 50%)',
                        filter: 'blur(120px)'
                    }}
                ></div>
            </div>

            {/* --- HERO SECTION --- */}
            <main className="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 relative z-10">
                <div className="w-full max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-down text-foreground" style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.1)' }}>
                       ¡Gracias por confiar en {business.name}!
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-down animation-delay-300">
                       Tu opinión es muy importante para nosotros. Por favor, déjanos una reseña para ayudarnos a mejorar.
                    </p>
                    
                    {/* Glowing Review Card Container */}
                    <div className="relative group animate-fade-in-up animation-delay-600">
                        {/* The Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-xl blur-lg opacity-25 dark:opacity-40 group-hover:opacity-40 dark:group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                        
                        {/* The Card itself */}
                        <div className="relative bg-card/80 dark:bg-slate-900/80 backdrop-blur-md border rounded-xl">
                           <ReviewForm business={business} />
                        </div>
                    </div>
                </div>
            </main>

            {/* --- INFORMATIONAL SECTIONS --- */}
            <TopReviewsSection reviews={business.topReviews} />

            <section className="bg-muted/30 py-20 md:py-28">
                <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold mb-6">Contacto y Ubicación</h2>
                        <div className="space-y-4 text-muted-foreground text-lg">
                            <div className="flex items-start gap-3"><MapIcon className="h-6 w-6 mt-1 text-primary"/><span>{business.address}</span></div>
                            <div className="flex items-center gap-3"><Phone className="h-6 w-6 text-primary"/><span>{business.phone || 'Teléfono no disponible'}</span></div>
                            {business.website && (<div className="flex items-center gap-3"><Globe className="h-6 w-6 text-primary"/><a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Ver sitio web</a></div>)}
                        </div>
                         {business.gmbPageUrl && (
                           <div className="mt-8">
                                <Button asChild>
                                    <a 
                                        href={`https://wa.me/?text=${encodeURIComponent(`¡Hola! Te recomiendo este lugar: ${business.name}. Aquí tienes el enlace a Google Maps: ${business.gmbPageUrl}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="mr-2 h-5 w-5"/>
                                        Compartir con un amigo
                                    </a>
                                </Button>
                           </div>
                        )}
                    </div>
                    {googleMapsApiKey && center && (
                        <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl order-1 md:order-2">
                            <APIProvider apiKey={googleMapsApiKey}><GoogleMap defaultCenter={center} defaultZoom={15} mapId="businessLocationMap" gestureHandling="cooperative"><Marker position={center} /></GoogleMap></APIProvider>
                        </div>
                    )}
                </div>
            </section>
            
            <PhotoCarouselSection business={business} googleMapsApiKey={googleMapsApiKey} />

             <footer className="py-6">
                <div className="container mx-auto text-center text-muted-foreground">
                    <p>© {new Date().getFullYear()} {business.name}. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

// Componente para el carrusel de fotos
const PhotoCarouselSection = ({ business, googleMapsApiKey }: PhotoCarouselProps) => {
    if (!business.photos || business.photos.length === 0) {
        return null; // No renderizar nada si no hay fotos
    }

    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Galería de Imágenes</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Un vistazo a nuestro espacio y trabajo.</p>
                </div>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {business.photos.map((photo, index) => {
                            const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1000&key=${googleMapsApiKey}`;
                            return (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <Card className="overflow-hidden">
                                            <CardContent className="flex aspect-square items-center justify-center p-0">
                                                <Image 
                                                    src={photoUrl} 
                                                    alt={`${business.name} photo ${index + 1}`}
                                                    width={500}
                                                    height={500}
                                                    className="object-cover w-full h-full"
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="ml-12" />
                    <CarouselNext className="mr-12" />
                </Carousel>
            </div>
        </section>
    );
};


// Componente para la sección de "Top Reviews"
const TopReviewsSection = ({ reviews }: TopReviewsProps) => {
    if (!reviews || reviews.length === 0) return null;
    return (
        <section className="bg-muted/30 py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">La opinión de nuestros clientes</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Valoramos cada comentario. Tu opinión nos ayuda a mejorar cada día.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.slice(0, 3).map((review, index) => (
                        <Card key={index} className="flex flex-col bg-card/50 dark:bg-slate-900/50 backdrop-blur-lg border rounded-xl">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                {review.profilePhotoUrl && (<Image src={review.profilePhotoUrl} alt={review.authorName} width={48} height={48} className="rounded-full" />)}
                                <div>
                                    <CardTitle className="text-lg">{review.authorName}</CardTitle>
                                    <StarRating rating={review.rating} className="mt-1" />
                                </div>
                            </CardHeader>
                            <CardContent><p className="text-muted-foreground italic">"{review.text}"</p></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Componente para mostrar las estrellas de valoración
const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        ))}
    </div>
);
