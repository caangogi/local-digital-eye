"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Building, LinkIcon, Star, Search } from 'lucide-react';
import { extractGmbData, type GmbDataExtractionInput, type GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import { useToast } from "@/hooks/use-toast";
import { connectBusiness } from '@/actions/business.actions';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

const addBusinessSchema = z.object({
  query: z.string().min(3, { message: "La búsqueda debe tener al menos 3 caracteres." }),
});

type AddBusinessFormValues = z.infer<typeof addBusinessSchema>;

export default function AddBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('BusinessesPage');

  const [isLoading, setIsLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GmbDataExtractionOutput[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddBusinessFormValues>({
    resolver: zodResolver(addBusinessSchema),
    defaultValues: { query: "" },
  });

  const handleSearchSubmit: SubmitHandler<AddBusinessFormValues> = async (data) => {
    setIsLoading(true);
    setSearchResults(null);
    setError(null);
    try {
      const results = await extractGmbData(data);
       if (!results || results.length === 0) {
        setError(t('add.notFound'));
        setSearchResults(null);
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      console.error("Error searching for business:", err);
      setError(err.message || t('add.searchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBusiness = async (businessData: GmbDataExtractionOutput) => {
    if (!businessData.placeId) return;
    
    setConnectingId(businessData.placeId);
    try {
        const response = await connectBusiness(businessData);
        if (response.success) {
            toast({
                title: t('add.connectSuccessTitle'),
                description: `"${businessData.extractedName}" se ha añadido a tus negocios.`,
                variant: 'default',
            });
            // Visually remove the connected business from the list
            setSearchResults(prev => prev?.filter(b => b.placeId !== businessData.placeId) || null);
            router.refresh(); 
        } else {
            toast({
                title: t('add.connectErrorTitle'),
                description: response.message,
                variant: 'destructive',
            });
        }
    } catch (err) {
        toast({
            title: t('add.connectErrorTitle'),
            description: t('add.connectErrorDescription'),
            variant: 'destructive',
        });
        console.error("Error connecting business:", err);
    } finally {
        setConnectingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('add.title')}</h1>
        <p className="text-muted-foreground">{t('add.subtitle')}</p>
      </div>

      <Card className="shadow-lg hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Search className="mr-2 h-5 w-5 text-primary" />{t('add.findTitle')}</CardTitle>
          <CardDescription>Busca por tipo y zona (ej: "fontaneros en Madrid") o por nombre específico.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSearchSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Términos de búsqueda</FormLabel>
                    <FormControl><Input placeholder="ej: Electricistas en Inca, Mallorca" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {t('add.searchButton')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {error && <p className="p-4 text-sm text-destructive bg-destructive/10 rounded-md m-4 text-center">{error}</p>}
      
      {searchResults && (
        <div className="border-t pt-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center">{t('add.resultTitle')} ({searchResults.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(result => (
              <Card key={result.placeId} className="bg-muted/30 flex flex-col">
                <CardHeader>
                    <CardTitle className="text-base">{result.extractedName}</CardTitle>
                    <CardDescription className="text-xs">{result.address}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex justify-between items-center text-xs mt-2 text-muted-foreground">
                        <span className="font-semibold flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/> {result.rating || 'N/A'} ({result.reviewCount || 0})</span>
                        <span className="font-semibold capitalize">{result.category?.replace(/_/g, ' ').toLowerCase() || 'Business'}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                      onClick={() => handleConnectBusiness(result)} 
                      disabled={connectingId === result.placeId} 
                      className="w-full"
                      size="sm"
                    >
                        {connectingId === result.placeId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4"/>}
                        {t('add.connectButton')}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Buscando negocios...</p>
        </div>
      )}
    </div>
  );
}
