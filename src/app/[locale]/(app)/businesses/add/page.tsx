
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Star, Link as LinkIcon, Building } from 'lucide-react';
import { extractGmbData, type GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import { connectBusiness } from '@/actions/business.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation';
import { Separator } from '@/components/ui/separator';

const searchSchema = z.object({
  name: z.string().min(3, { message: "El nombre del negocio debe tener al menos 3 caracteres." }),
  location: z.string().optional(),
});
type SearchFormValues = z.infer<typeof searchSchema>;

export default function AddBusinessPage() {
  const t = useTranslations('BusinessesPage.add');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GmbDataExtractionOutput[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { name: "", location: "" },
  });

  const handleSearch: SubmitHandler<SearchFormValues> = async (data) => {
    setIsLoading(true);
    setSearchResults([]);
    try {
      const query = data.location ? `${data.name}, ${data.location}` : data.name;
      const results = await extractGmbData({ query });
      if (results && results.length > 0) {
        setSearchResults(results);
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
        router.push('/businesses');
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

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
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
            <form onSubmit={form.handleSubmit(handleSearch)} className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="name"
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
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="self-end">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {t('searchButton')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('resultTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map((result) => (
              <div key={result.placeId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-grow">
                    <p className="font-bold flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground"/>{result.extractedName}</p>
                    <p className="text-sm text-muted-foreground">{result.address}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-current"/>{result.rating || 'N/A'} ({result.reviewCount || 0} {t('reviewsLabel')})</span>
                        <span className="capitalize">{result.category?.replace(/_/g, ' ')}</span>
                    </div>
                </div>
                <Button onClick={() => handleConnect(result)} disabled={isConnecting === result.placeId} className="w-full sm:w-auto">
                  {isConnecting === result.placeId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                  {t('connectButton')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
