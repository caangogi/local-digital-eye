
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Star, Link as LinkIcon, Building, Trash2, Filter } from 'lucide-react';
import { extractGmbData, type GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import { connectBusiness } from '@/actions/business.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const searchSchema = z.object({
  query: z.string().min(3, { message: "La consulta debe tener al menos 3 caracteres." }),
});
type SearchFormValues = z.infer<typeof searchSchema>;

const CACHE_KEY = 'prospecting_search_results';

export default function AddBusinessPage() {
  const t = useTranslations('BusinessesPage.add');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GmbDataExtractionOutput[]>([]);
  const [filteredResults, setFilteredResults] = useState<GmbDataExtractionOutput[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([5]);
  
  const { toast } = useToast();
  const router = useRouter();

  // Load results from localStorage on initial render
  useEffect(() => {
    try {
      const cachedResults = localStorage.getItem(CACHE_KEY);
      if (cachedResults) {
        setSearchResults(JSON.parse(cachedResults));
      }
    } catch (error) {
      console.error("Failed to parse cached results:", error);
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  // Update filtered results when searchResults or filter changes
  useEffect(() => {
    const results = searchResults.filter(business => {
        // Handle cases where rating is null or undefined
        const businessRating = business.rating ?? 0;
        return businessRating <= ratingFilter[0];
    });
    setFilteredResults(results);
  }, [searchResults, ratingFilter]);


  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

  const handleSearch: SubmitHandler<SearchFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const results = await extractGmbData({ query: data.query });
      if (results && results.length > 0) {
        // Combine new results with existing ones, avoiding duplicates
        const existingPlaceIds = new Set(searchResults.map(r => r.placeId));
        const newUniqueResults = results.filter(r => !existingPlaceIds.has(r.placeId));
        
        const updatedResults = [...searchResults, ...newUniqueResults];
        setSearchResults(updatedResults);
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedResults));
        
        toast({ title: `${newUniqueResults.length} nuevos prospectos añadidos a la lista.`});
      } else {
        toast({ title: t('notFound'), variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: t('searchError'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (businessData: GmbDataExtractionOutput) => {
    if (!businessData.placeId) return;
    setIsConnecting(businessData.placeId);
    try {
      const response = await connectBusiness(businessData);
      if (response.success && response.businessId) {
        toast({
          title: t('connectSuccessTitle'),
          description: t('connectSuccessDescription'),
        });
        // Remove connected business from the list
        const updatedResults = searchResults.filter(r => r.placeId !== businessData.placeId);
        setSearchResults(updatedResults);
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedResults));
      } else {
        toast({
          title: t('connectErrorTitle'),
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: t('connectErrorTitle'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const clearCache = () => {
    setSearchResults([]);
    setFilteredResults([]);
    localStorage.removeItem(CACHE_KEY);
    toast({title: "Lista de prospectos limpiada."});
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('findTitle')}</CardTitle>
          <CardDescription>{t('findDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>{t('nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {t('searchButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>{t('resultTitle')} ({filteredResults.length} / {searchResults.length})</CardTitle>
                    <CardDescription>{t('prospectListDescription')}</CardDescription>
                </div>
                <Button onClick={clearCache} variant="outline" size="sm"><Trash2 className="mr-2 h-4 w-4"/> {t('clearListButton')}</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
                <div className="grid gap-2">
                    <Label htmlFor="rating-filter" className="flex items-center gap-2"><Filter className="w-4 h-4" />{t('ratingFilterLabel')}: <span className="font-bold text-primary">{ratingFilter[0].toFixed(1)} estrellas o menos</span></Label>
                    <Slider
                        id="rating-filter"
                        max={5}
                        min={0}
                        step={0.1}
                        value={ratingFilter}
                        onValueChange={setRatingFilter}
                    />
                </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {filteredResults.map((result) => (
              <div key={result.placeId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-grow">
                    <p className="font-bold flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground"/>{result.extractedName}</p>
                    <p className="text-sm text-muted-foreground">{result.address}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 font-semibold"><Star className="w-3 h-3 text-yellow-500 fill-current"/>{result.rating || 'N/A'} ({result.reviewCount || 0} {t('reviewsLabel')})</span>
                         <a href={result.website || '#'} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-1", result.website ? 'hover:text-primary' : 'text-muted-foreground/50')}>
                            <LinkIcon className="w-3 h-3"/> {result.website ? 'Con Web' : 'Sin Web'}
                         </a>
                        <span className="capitalize">{result.category?.replace(/_/g, ' ')}</span>
                    </div>
                </div>
                <Button onClick={() => handleConnect(result)} disabled={isConnecting === result.placeId} className="w-full sm:w-auto">
                  {isConnecting === result.placeId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                  {t('connectButton')}
                </Button>
              </div>
            ))}
            </div>
             {filteredResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No hay resultados que coincidan con tus filtros.</p>
                    <p className="text-sm">Intenta ajustar el filtro de calificación o realiza una nueva búsqueda.</p>
                </div>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    