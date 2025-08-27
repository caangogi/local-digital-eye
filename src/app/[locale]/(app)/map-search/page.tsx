import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Square, Circle as CircleIcon, Minimize2 } from "lucide-react"; 
import Image from "next/image";
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: t('mapSearch')
  };
}

export default function MapSearchPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Geographic Business Search</h1>
          <p className="text-muted-foreground">Discover businesses by category within specific geographic zones.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-grow">
        <div className="md:col-span-1">
          <Card className="shadow-md h-full hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-headline">Search Controls</CardTitle>
              <CardDescription>Define your search area and criteria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="business-category" className="block text-sm font-medium text-foreground mb-1">Business Category</label>
                <select id="business-category" className="w-full p-2 border border-border rounded-md bg-background">
                  <option>Restaurants</option>
                  <option>Retail Stores</option>
                  <option>Salons & Spas</option>
                  <option>Automotive Services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Zone Selection Tools</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" title="Draw Square"><Square className="h-4 w-4"/></Button>
                  <Button variant="outline" size="icon" title="Draw Circle"><CircleIcon className="h-4 w-4"/></Button>
                  <Button variant="outline" size="icon" title="Draw Polygon"><Minimize2 className="h-4 w-4 transform rotate-45"/></Button>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Search className="mr-2 h-4 w-4" /> Search Businesses
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 h-full">
          <Card className="shadow-md h-full hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <MapPin className="mr-2 text-primary h-5 w-5" /> Interactive Map
              </CardTitle>
              <CardDescription>Select an area on the map or use tools to define a zone.</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)]"> 
              <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                <Image 
                    src="https://picsum.photos/800/600" 
                    alt="Interactive Map Placeholder" 
                    width={800} 
                    height={600} 
                    className="rounded-md object-cover w-full h-full"
                    data-ai-hint="map interface"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
