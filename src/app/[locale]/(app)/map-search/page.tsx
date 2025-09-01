
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react"; 
import {getTranslations} from 'next-intl/server';
import { MapSearchComponent } from './_components/MapSearchComponent';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: t('mapSearch')
  };
}

export default function MapSearchPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
         <Card className="max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-destructive">Configuration Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The Google Maps API key is missing. Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your environment variables.</p>
            </CardContent>
         </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Geographic Business Search</h1>
          <p className="text-muted-foreground">Discover businesses by category within specific geographic zones.</p>
        </div>
      </div>
      <MapSearchComponent apiKey={apiKey} />
    </div>
  );
}
