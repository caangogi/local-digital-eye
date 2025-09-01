
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, List, LayoutGrid } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from 'next-intl';
import { listUserBusinesses } from "@/actions/business.actions";
import { ToastHandler } from "./_components/ToastHandler";
import type { Business } from '@/backend/business/domain/business.entity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessList } from './_components/BusinessList';
import { PipelineView } from './_components/PipelineView';

export default function BusinessesPage() {
  const t = useTranslations('BusinessesPage');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

  useEffect(() => {
    async function loadBusinesses() {
      setIsLoading(true);
      try {
        const userBusinesses = await listUserBusinesses();
        setBusinesses(userBusinesses);
      } catch (error) {
        console.error("Failed to load businesses:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <ToastHandler />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/businesses/add">
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
          {isLoading ? (
             <div className="flex justify-center items-center p-8 h-64">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <PipelineView initialBusinesses={businesses} />
          )}
        </TabsContent>
        <TabsContent value="list" className="mt-4">
           {isLoading ? (
             <div className="flex justify-center items-center p-8 h-64">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <BusinessList businesses={businesses} baseUrl={baseUrl} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
