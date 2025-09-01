
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from 'next-intl/server';
import { MapSearchComponent } from './_components/MapSearchComponent';
import { listUserBusinesses } from '@/actions/business.actions';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: t('mapSearch')
  };
}

export default async function MapSearchPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const businesses = await listUserBusinesses();

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
      <MapSearchComponent apiKey={apiKey} businesses={businesses} />
    </div>
  );
}
