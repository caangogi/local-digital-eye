import React from 'react';
import { getBusinessDetails } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import { BusinessPublicProfileView } from './_components/BusinessPublicProfileView';

// This is the SERVER COMPONENT responsible for fetching data
export default async function BusinessPublicProfilePage({ params }: { params: { businessId: string } }) {
    
    const business = await getBusinessDetails(params.businessId);

    if (!business) {
        notFound();
    }
    
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // We pass the fetched data to the client component
    return (
        <BusinessPublicProfileView 
            business={business}
            googleMapsApiKey={googleMapsApiKey}
        />
    );
}
