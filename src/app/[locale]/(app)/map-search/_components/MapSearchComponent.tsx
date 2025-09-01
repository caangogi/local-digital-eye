
'use client';

import { useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Link as LinkIcon, Star } from 'lucide-react';
import { extractGmbData } from '@/ai/flows/gmb-data-extraction-flow';
import type { GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import { useToast } from '@/hooks/use-toast';
import { connectBusiness } from '@/actions/business.actions';

interface MapSearchComponentProps {
  apiKey: string;
}

export function MapSearchComponent({ apiKey }: MapSearchComponentProps) {
  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <MapSearchContent />
    </APIProvider>
  );
}

function MapSearchContent() {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken>();
  const [places, setPlaces] = useState<GmbDataExtractionOutput[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GmbDataExtractionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultPosition = useMemo(() => ({ lat: 40.416775, lng: -3.703790 }), []); // Default to Madrid

  const handleSearch = async (query: string) => {
    if (!placesLibrary || !map || !query) return;

    setLoading(true);
    try {
      const results = await extractGmbData({ query });
      if (results && results.length > 0) {
        setPlaces(results);
        const firstResultLocation = results[0].location;
        if (firstResultLocation) {
            map.moveCamera({ center: firstResultLocation, zoom: 14 });
        }
      } else {
        setPlaces([]);
        toast({ title: "No Results", description: "No businesses found for your search query."});
      }
    } catch (e: any) {
        console.error('Search failed', e);
        toast({ title: "Search Error", description: e.message, variant: "destructive"});
    }
    setLoading(false);
  };
  
  const handleConnect = async (businessData: GmbDataExtractionOutput) => {
    if (!businessData.placeId) return;
    
    setConnectingId(businessData.placeId);
    try {
        const response = await connectBusiness(businessData);
        if (response.success) {
            toast({
                title: "Business Connected!",
                description: `"${businessData.extractedName}" has been added to your businesses.`,
                variant: 'default',
            });
            // Optionally remove from list after connecting
            setPlaces(prev => prev.filter(p => p.placeId !== businessData.placeId));
            setSelectedPlace(null);
        } else {
            toast({
                title: "Connection Failed",
                description: response.message,
                variant: 'destructive',
            });
        }
    } catch (err) {
        toast({
            title: "Connection Error",
            description: "An unexpected error occurred.",
            variant: 'destructive',
        });
    } finally {
        setConnectingId(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 flex-grow h-full">
        {/* Left Panel: Search and Results */}
        <Card className="md:col-span-1 flex flex-col shadow-md h-full">
            <CardHeader>
                <CardTitle className="font-headline">Prospect Search</CardTitle>
                <CardDescription>Find businesses by category and location.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(e.currentTarget.searchQuery.value); }} className="flex gap-2">
                    <Input name="searchQuery" placeholder="e.g., Fontaneros en Madrid" disabled={loading} />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </form>

                <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                    {places.map((place) => (
                        <Card 
                            key={place.placeId} 
                            className="p-3 cursor-pointer hover:bg-muted"
                            onClick={() => {
                                setSelectedPlace(place);
                                if (place.location) {
                                    map?.moveCamera({center: place.location, zoom: 16});
                                }
                            }}
                        >
                            <p className="font-semibold text-sm">{place.extractedName}</p>
                            <p className="text-xs text-muted-foreground">{place.address}</p>
                             <div className="flex justify-between items-center text-xs mt-2 text-muted-foreground">
                                <span className="font-semibold flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/> {place.rating || 'N/A'} ({place.reviewCount || 0})</span>
                                <span className="font-semibold capitalize">{place.category?.replace(/_/g, ' ').toLowerCase() || 'Business'}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        {/* Right Panel: Map */}
        <div className="md:col-span-2 h-full min-h-[400px] md:min-h-0">
             <Card className="shadow-md h-full w-full">
                <Map
                    defaultCenter={defaultPosition}
                    defaultZoom={12}
                    mapId="localDigitalEyeMap"
                    className="rounded-lg h-full w-full"
                >
                    {places.map(place => place.location && (
                        <AdvancedMarker 
                            key={place.placeId} 
                            position={place.location}
                            onClick={() => setSelectedPlace(place)}
                        >
                            <Pin 
                                background={selectedPlace?.placeId === place.placeId ? 'hsl(var(--primary))' : '#AAB2C0'}
                                borderColor={selectedPlace?.placeId === place.placeId ? 'hsl(var(--primary))' : '#788296'}
                                glyphColor={'#fff'}
                            />
                        </AdvancedMarker>
                    ))}
                    
                    {selectedPlace && selectedPlace.location && (
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-10">
                            <Card className="p-4 shadow-2xl bg-popover">
                                <h3 className="font-bold">{selectedPlace.extractedName}</h3>
                                <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
                                <Button 
                                    size="sm" 
                                    className="w-full mt-3"
                                    onClick={() => handleConnect(selectedPlace)}
                                    disabled={connectingId === selectedPlace.placeId}
                                >
                                    {connectingId === selectedPlace.placeId ? <Loader2 className="animate-spin"/> : <LinkIcon />}
                                    Connect Business
                                </Button>
                            </Card>
                        </div>
                    )}
                </Map>
            </Card>
        </div>
    </div>
  );
}
