
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, List, LayoutGrid } from "lucide-react";
import { Link } from "@/navigation";
import { getTranslations } from 'next-intl/server';
import { listUserBusinesses } from "@/actions/business.actions";
import { ToastHandler } from "./_components/ToastHandler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessList } from './_components/BusinessList';
import { PipelineLoader } from './_components/PipelineLoader';

// This is a SERVER COMPONENT
export default async function BusinessesPage() {
  const t = await getTranslations('BusinessesPage');
  
  // Fetch data on the server before rendering the page
  const businesses = await listUserBusinesses();
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/map-search">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('addButton')}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="pipeline"><LayoutGrid className="mr-2 h-4 w-4" />Pipeline</TabsTrigger>
          <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pipeline" className="mt-4">
            <PipelineLoader initialBusinesses={businesses} />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
            <BusinessList businesses={businesses} baseUrl={baseUrl} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
