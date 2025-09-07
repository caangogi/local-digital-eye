
'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Star, Link as LinkIcon, Building, Trash2, Globe } from 'lucide-react';
import { extractGmbData, type GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import { connectBusiness } from '@/actions/business.actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DebugCollapse } from '@/components/dev/DebugCollapse';
import type { Place } from '@/services/googleMapsService';


const searchSchema = z.object({
  query: z.string().min(3, { message: "La consulta debe tener al menos 3 caracteres." }),
});
type SearchFormValues = z.infer<typeof searchSchema>;

type WebsiteFilter = 'all' | 'with_website' | 'without_website';

// Simplified state for the prospect list
interface ProspectListState {
    prospects: GmbDataExtractionOutput[];
    searchRawResponse?: any;
    connectRawResponse?: Place | null;
}

export default function AddBusinessPage() {
  const t = useTranslations('ProspectingPage');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  // State for search results and debug data
  const [prospectState, setProspectState] = useState<ProspectListState>({ 
    prospects: [],
    searchRawResponse: null,
    connectRawResponse: null,
  });
  
  const [ratingFilter, setRatingFilter] = useState<number[]>([5]);
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>('all');
  
  const { toast } = useToast();

  const filteredResults = useMemo(() => {
      return prospectState.prospects.filter(business => {
          const rating = business.rating ?? 0;
          if (rating > ratingFilter[0]) return false;

          if (websiteFilter === 'with_website' && !business.website) return false;
          if (websiteFilter === 'without_website' && business.website) return false;
          
          return true;
      });
  }, [prospectState.prospects, ratingFilter, websiteFilter]);


  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

  const handleSearch: SubmitHandler<SearchFormValues> = async (data) => {
    setIsLoading(true);
    setProspectState(prevState => ({ ...prevState, connectRawResponse: null })); // Clear previous connection debug data

    try {
      const results = await extractGmbData({ query: data.query });
      
      setProspectState(prevState => {
        const existingPlaceIds = new Set(prevState.prospects.map(p => p.placeId));
        const newUniqueProspects = (results?.mappedData || []).filter(p => !existingPlaceIds.has(p.placeId));

        if (newUniqueProspects.length > 0) {
            toast({ title: `${newUniqueProspects.length} ${t('newProspectsToast')}` });
        } else if (results?.mappedData) {
            toast({ title: t('noNewProspectsToast') });
        } else {
            toast({ title: t('notFound'), variant: "destructive" });
        }

        return {
            ...prevState,
            prospects: [...prevState.prospects, ...newUniqueProspects],
            searchRawResponse: results?.rawData, // Store raw search response for debugging
        };
      });

    } catch (error: any) {
      toast({ title: t('searchError'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  const handleConnect = async (businessData: GmbDataExtractionOutput) => {
    if (!businessData.placeId) return;
    setIsConnecting(businessData.placeId);
    setProspectState(prevState => ({ ...prevState, connectRawResponse: null })); // Clear previous debug data

    try {
      const response = await connectBusiness(businessData);
      
      if (response.success && response.businessId) {
        toast({
          title: t('connectSuccessTitle'),
          description: t('connectSuccessDescription'),
        });
        // Remove connected prospect from the list
        setProspectState(prevState => ({
          ...prevState,
          prospects: prevState.prospects.filter(p => p.placeId !== businessData.placeId),
          connectRawResponse: response.debugData, // Store raw connect response for debugging
        }));
      } else {
        toast({ title: t('connectErrorTitle'), description: response.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: t('connectErrorTitle'), description: error.message, variant: "destructive" });
    } finally {
      setIsConnecting(null);
    }
  };

  const clearList = () => {
    setProspectState({ prospects: [], searchRawResponse: null, connectRawResponse: null });
    toast({title: t('clearListSuccessToast')});
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
                    <FormLabel>{t('queryLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('queryPlaceholder')} {...field} />
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
      
      {prospectState.prospects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                <div>
                    <CardTitle>{t('prospectListTitle')} ({filteredResults.length} / {prospectState.prospects.length})</CardTitle>
                    <CardDescription>{t('prospectsFoundDescription')}</CardDescription>
                </div>
                <Button onClick={clearList} variant="outline" size="sm"><Trash2 className="mr-2 h-4 w-4"/> {t('clearListButton')}</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="rating-filter" className="flex items-center gap-2"><Star className="w-4 h-4" />{t('ratingFilterLabel')}: <span className="font-bold text-primary">{ratingFilter[0].toFixed(1)} {t('ratingFilterUnit')}</span></Label>
                    <Slider id="rating-filter" max={5} min={0} step={0.1} value={ratingFilter} onValueChange={setRatingFilter} />
                </div>
                <div className="grid gap-2">
                     <Label htmlFor="website-filter" className="flex items-center gap-2"><Globe className="w-4 h-4" />{t('websiteFilterLabel')}</Label>
                     <Select value={websiteFilter} onValueChange={(value: WebsiteFilter) => setWebsiteFilter(value)}>
                        <SelectTrigger id="website-filter">
                            <SelectValue placeholder={t('websiteFilterPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('websiteFilterAll')}</SelectItem>
                            <SelectItem value="with_website">{t('websiteFilterWith')}</SelectItem>
                            <SelectItem value="without_website">{t('websiteFilterWithout')}</SelectItem>
                        </SelectContent>
                     </Select>
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
                            <LinkIcon className="w-3 h-3"/> {result.website ? t('hasWebsite') : t('noWebsite')}
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
             {filteredResults.length === 0 && prospectState.prospects.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>{t('noFilterResults')}</p>
                    <p className="text-sm">{t('noFilterResultsHint')}</p>
                </div>
             )}
          </CardContent>
        </Card>
      )}

      {/* Debugger Section */}
      <div className="mt-8 space-y-4">
        {prospectState.searchRawResponse && (
            <DebugCollapse title="Respuesta Completa de Google (Búsqueda)" data={prospectState.searchRawResponse} />
        )}
        {prospectState.connectRawResponse && (
            <DebugCollapse title="Respuesta Completa de Google (Al Conectar)" data={prospectState.connectRawResponse} />
        )}
      </div>
    </div>
  );
}

    