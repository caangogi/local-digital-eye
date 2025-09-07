"use client";

import React from 'react';
import type { Business } from '@/backend/business/domain/business.entity';
import { ReviewForm } from '@/app/[locale]/review/[businessId]/_components/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, Phone, Globe, Star } from 'lucide-react';
import { Map as GoogleMap, APIProvider, Marker } from '@vis.gl/react-google-maps';
import Image from "next/image";

// Tipos para las props
interface BusinessPublicProfileViewProps {
    business: Business;
    googleMapsApiKey: string | undefined;
}
interface TopReviewsProps {
    reviews: Business['topReviews'];
}


// --- Componente principal de la Landing Page (ACTUALIZADO CON EL NUEVO DISEÑO) ---
export function BusinessPublicProfileView({ business, googleMapsApiKey }: BusinessPublicProfileViewProps) {
    const center = business.location ? { lat: business.location.latitude, lng: business.location.longitude } : null;

    return (
        <div className="bg-[#0B0C1E] text-white min-h-screen isolate">
            {/* Aurora Background Effect */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-15"
                    style={{
                        background: 'radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 50%)',
                        filter: 'blur(120px)'
                    }}
                ></div>
            </div>

            {/* --- HERO SECTION --- */}
            <main className="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 relative z-10">
                <div className="w-full max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-down" style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.5)' }}>
                       ¡Gracias por confiar en {business.name}!
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in-down animation-delay-300" style={{ textShadow: '0px 1px 5px rgba(0,0,0,0.5)' }}>
                       Tu opinión es muy importante para nosotros. Por favor, déjanos una reseña para ayudarnos a mejorar.
                    </p>
                    
                    {/* Glowing Review Card Container */}
                    <div className="relative group animate-fade-in-up animation-delay-600">
                        {/* The Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                        
                        {/* The Card itself */}
                        <div className="relative bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl">
                           <ReviewForm business={business} />
                        </div>
                    </div>
                </div>
            </main>

            {/* --- INFORMATIONAL SECTIONS --- */}
            <TopReviewsSection reviews={business.topReviews} />

            <section className="bg-slate-900/50 py-20 md:py-28">
                <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Contacto y Ubicación</h2>
                        <div className="space-y-4 text-slate-300 text-lg">
                            <div className="flex items-start gap-3"><MapIcon className="h-6 w-6 mt-1 text-primary"/><span>{business.address}</span></div>
                            <div className="flex items-center gap-3"><Phone className="h-6 w-6 text-primary"/><span>{business.phone || 'Teléfono no disponible'}</span></div>
                            {business.website && (<div className="flex items-center gap-3"><Globe className="h-6 w-6 text-primary"/><a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Ver sitio web</a></div>)}
                        </div>
                    </div>
                    {googleMapsApiKey && center && (
                        <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl">
                            <APIProvider apiKey={googleMapsApiKey}><GoogleMap defaultCenter={center} defaultZoom={15} mapId="businessLocationMap" gestureHandling="cooperative"><Marker position={center} /></GoogleMap></APIProvider>
                        </div>
                    )}
                </div>
            </section>
             <footer className="bg-[#0B0C1E] py-6">
                <div className="container mx-auto text-center text-slate-400">
                    <p>© {new Date().getFullYear()} {business.name}. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}


// Componente para la sección de "Top Reviews"
const TopReviewsSection = ({ reviews }: TopReviewsProps) => {
    if (!reviews || reviews.length === 0) return null;
    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">La opinión de nuestros clientes</h2>
                    <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Valoramos cada comentario. Tu opinión nos ayuda a mejorar cada día.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.slice(0, 3).map((review, index) => (
                        <Card key={index} className="flex flex-col bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-xl text-white">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                {review.profilePhotoUrl && (<Image src={review.profilePhotoUrl} alt={review.authorName} width={48} height={48} className="rounded-full" />)}
                                <div>
                                    <CardTitle className="text-lg text-white">{review.authorName}</CardTitle>
                                    <StarRating rating={review.rating} className="mt-1" />
                                </div>
                            </CardHeader>
                            <CardContent><p className="text-slate-300 italic">"{review.text}"</p></CardContent>
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
            <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
        ))}
    </div>
);