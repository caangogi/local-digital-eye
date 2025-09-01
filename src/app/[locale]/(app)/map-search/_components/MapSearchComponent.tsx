
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building, Star, Link as LinkIcon, Briefcase } from 'lucide-react';
import type { Business } from '@/backend/business/domain/business.entity';
import { listUserBusinesses } from '@/actions/business.actions';

interface MapSearchComponentProps {
  apiKey: string;
  businesses: Business[];
}

export function MapSearchComponent({ apiKey, businesses }: MapSearchComponentProps) {
  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <MapSearchContent businesses={businesses} />
    </APIProvider>
  );
}

function MapSearchContent({ businesses }: { businesses: Business[] }) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const defaultPosition = useMemo(() => ({ lat: 40.416775, lng: -3.703790 }), []); // Default to Madrid

  const salesStatusMap: { [key in string]: { label: string; color: string } } = {
    'new': { label: 'Nuevo', color: '#3b82f6' }, // blue-500
    'contacted': { label: 'Contactado', color: '#f59e0b' }, // amber-500
    'follow_up': { label: 'Seguimiento', color: '#f97316' }, // orange-500
    'closed_won': { label: 'Ganado', color: '#22c55e' }, // green-500
    'closed_lost': { label: 'Perdido', color: '#ef4444' }, // red-500
  };

  return (
    <Card className="shadow-md h-full w-full">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Briefcase/> Cartera de Negocios</CardTitle>
            <CardDescription>Visualiza todos tus prospectos y clientes en el mapa.</CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] p-0">
            <Map
                defaultCenter={defaultPosition}
                defaultZoom={6}
                mapId="localDigitalEyeMap"
                className="rounded-b-lg h-full w-full"
                gestureHandling="cooperative"
            >
                {businesses.map(business => business.location && (
                    <AdvancedMarker 
                        key={business.id} 
                        position={business.location}
                        onClick={() => setSelectedBusiness(business)}
                    >
                        <Pin 
                            background={salesStatusMap[business.salesStatus || 'new']?.color || '#6b7280'}
                            borderColor={'#fff'}
                            glyphColor={'#fff'}
                        />
                    </AdvancedMarker>
                ))}
                
                {selectedBusiness && selectedBusiness.location && (
                    <InfoWindow
                        position={selectedBusiness.location}
                        onCloseClick={() => setSelectedBusiness(null)}
                    >
                        <div className="p-2 max-w-xs">
                            <h3 className="font-bold text-base mb-1">{selectedBusiness.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{selectedBusiness.address}</p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span className="font-semibold flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/> {selectedBusiness.rating || 'N/A'} ({selectedBusiness.reviewCount || 0})</span>
                                <span className="font-semibold capitalize px-2 py-1 rounded" style={{ backgroundColor: salesStatusMap[selectedBusiness.salesStatus || 'new']?.color + '20', color: salesStatusMap[selectedBusiness.salesStatus || 'new']?.color }}>
                                    {salesStatusMap[selectedBusiness.salesStatus || 'new']?.label}
                                </span>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </Map>
        </CardContent>
    </Card>
  );
}
