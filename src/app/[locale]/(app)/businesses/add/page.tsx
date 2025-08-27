{"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Building, LinkIcon } from 'lucide-react';
import { extractGmbData, type GmbDataExtractionInput, type GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import { useToast } from "@/hooks/use-toast";
import { connectBusiness } from '@/actions/business.actions';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

const addBusinessSchema = z.object({
  businessName: z.string().min(3, { message: "Business name must be at least 3 characters." }),
  location: z.string().min(3, { message: "Location is required to find the correct business." }),
});

type AddBusinessFormValues = z.infer<typeof addBusinessSchema>;

export default function AddBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('BusinessesPage');

  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchResult, setSearchResult] = useState<GmbDataExtractionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddBusinessFormValues>({
    resolver: zodResolver(addBusinessSchema),
    defaultValues: { businessName: "", location: "" },
  });

  const handleSearchSubmit: SubmitHandler<AddBusinessFormValues> = async (data) => {
    setIsLoading(true);
    setSearchResult(null);
    setError(null);
    try {
      const result = await extractGmbData(data);
       if (!result || !result.placeId) {
        setError(t('add.notFound'));
        setSearchResult(null);
      } else {
        setSearchResult(result);
      }
    } catch (err) {
      console.error("Error searching for business:", err);
      setError(t('add.searchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBusiness = async () => {
    if (!searchResult) return;
    
    setIsConnecting(true);
    try {
        const response = await connectBusiness(searchResult);
        if (response.success) {
            toast({
                title: t('add.connectSuccessTitle'),
                description: t('add.connectSuccessDescription'),
                variant: 'default',
            });
            router.push('/businesses');
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
        setIsConnecting(false);
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
          <CardTitle className="font-headline flex items-center"><Building className="mr-2 h-5 w-5 text-primary" />{t('add.findTitle')}</CardTitle>
          <CardDescription>{t('add.findDescription')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSearchSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('add.nameLabel')}</FormLabel>
                    <FormControl><Input placeholder={t('add.namePlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('add.locationLabel')}</FormLabel>
                    <FormControl><Input placeholder={t('add.locationPlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('add.searchButton')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {error && <p className="p-4 text-sm text-destructive bg-destructive/10 rounded-md m-4">{error}</p>}
      
      {searchResult && (
        <div className="p-4 border-t">
          <h3 className="font-semibold text-lg mb-4 flex items-center">{t('add.resultTitle')}</h3>
          <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle>{searchResult.extractedName}</CardTitle>
                <CardDescription>{searchResult.address}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic">
                    "{searchResult.briefReviewSummary}"
                </p>
                <div className="flex justify-between items-center text-sm mt-4">
                    <span className="font-semibold">{t('add.ratingLabel')}: {searchResult.rating || 'N/A'} ({searchResult.reviewCount || 0} {t('add.reviewsLabel')})</span>
                    <span className="font-semibold capitalize">{searchResult.category?.replace(/_/g, ' ').toLowerCase() || 'Business'}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleConnectBusiness} disabled={isConnecting} className="w-full">
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <LinkIcon className="mr-2 h-4 w-4"/>
                    {t('add.connectButton')}
                </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
