
"use client";

import React from 'react';
import type { Business } from '@/backend/business/domain/business.entity';

interface BusinessPublicProfileViewProps {
    business: Business;
}

// This is the CLIENT COMPONENT responsible for UI and animations
export function BusinessPublicProfileView({ business }: BusinessPublicProfileViewProps) {
    return (
        <div className="min-h-screen bg-background p-8">
           <h1 className="text-3xl font-bold font-headline text-primary">{business.name}</h1>
           {/* The rest of the new design will be built here */}
        </div>
    );
}
