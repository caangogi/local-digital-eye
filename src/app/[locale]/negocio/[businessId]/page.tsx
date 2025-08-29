
import React from 'react';
import { getBusinessDetails } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "../../review/[businessId]/_components/ReviewForm";
import { Phone, Globe, Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { Business } from '@/backend/business/domain/business.entity';
import { BusinessPublicProfileView } from './_components/BusinessPublicProfileView';

// Helper function to build the Google Photo URL
export const getGooglePhotoUrl = (photoName: string, maxWidthPx = 800) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.warn("Google Maps API key is not configured for photo URLs.");
        return `https://picsum.photos/${maxWidthPx}/400`; // Fallback placeholder
    }
    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=${maxWidthPx}&key=${apiKey}`;
}

// This is now a SERVER COMPONENT responsible for fetching data
export default async function BusinessPublicProfilePage({ params }: { params: { businessId: string } }) {
    
    const business = await getBusinessDetails(params.businessId);

    if (!business) {
        notFound();
    }
    
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${business.placeId}`;
    
    // We pass the fetched data and other necessary props to the client component
    return (
        <BusinessPublicProfileView 
            business={business} 
            mapEmbedUrl={mapEmbedUrl}
        />
    );
}
