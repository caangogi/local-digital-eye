"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Bot } from 'lucide-react';
import { recommendServices, type ServiceRecommendationInput, type ServiceRecommendationOutput } from '@/ai/flows/service-recommendation';
import { analyzeReviewSentiment, type AnalyzeReviewSentimentInput, type AnalyzeReviewSentimentOutput } from '@/ai/flows/review-sentiment-analysis';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// Removed getTranslator as this is a client component

const serviceRecommendationSchema = z.object({
  businessProfile: z.string().min(50, { message: "Business profile must be at least 50 characters." }),
  businessType: z.string().min(3, { message: "Business type is required." }),
});

const reviewAnalysisSchema = z.object({
  reviews: z.string().min(100, { message: "Reviews must be at least 100 characters." }),
});

type ServiceRecommendationFormValues = z.infer<typeof serviceRecommendationSchema>;
type ReviewAnalysisFormValues = z.infer<typeof reviewAnalysisSchema>;

export default function ServiceRecommendationsPage() {
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [serviceResults, setServiceResults] = useState<ServiceRecommendationOutput | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewResults, setReviewResults] = useState<AnalyzeReviewSentimentOutput | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const serviceForm = useForm<ServiceRecommendationFormValues>({
    resolver: zodResolver(serviceRecommendationSchema),
    defaultValues: { businessProfile: "", businessType: "" },
  });

  const reviewForm = useForm<ReviewAnalysisFormValues>({
    resolver: zodResolver(reviewAnalysisSchema),
    defaultValues: { reviews: "" },
  });

  const handleServiceRecommendationSubmit: SubmitHandler<ServiceRecommendationFormValues> = async (data) => {
    setIsLoadingServices(true);
    setServiceResults(null);
    setServiceError(null);
    try {
      const result = await recommendServices(data);
      setServiceResults(result);
    } catch (error) {
      console.error("Error recommending services:", error);
      setServiceError("Failed to get service recommendations. Please try again.");
    } finally {
      setIsLoadingServices(false);
    }
  };
  
  const handleReviewAnalysisSubmit: SubmitHandler<ReviewAnalysisFormValues> = async (data) => {
    setIsLoadingReviews(true);
    setReviewResults(null);
    setReviewError(null);
    try {
      const result = await analyzeReviewSentiment(data);
      setReviewResults(result);
    } catch (error) {
      console.error("Error analyzing reviews:", error);
      setReviewError("Failed to analyze reviews. Please try again.");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">AI-Powered Insights</h1>
        <p className="text-muted-foreground">Leverage AI to get service recommendations and analyze customer sentiment.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" />Service Recommendations</CardTitle>
            <CardDescription>Enter business details to get AI-powered service recommendations.</CardDescription>
          </CardHeader>
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(handleServiceRecommendationSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={serviceForm.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type (e.g., Restaurant, Retail)</FormLabel>
                      <FormControl><Input placeholder="Bakery" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={serviceForm.control}
                  name="businessProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Profile</FormLabel>
                      <FormControl><Textarea placeholder="Describe the business, its online presence, customers, etc." {...field} rows={5} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoadingServices} className="w-full bg-primary hover:bg-primary/90">
                  {isLoadingServices && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Recommendations
                </Button>
              </CardFooter>
            </form>
          </Form>
          {serviceError && <p className="p-4 text-sm text-destructive bg-destructive/10 rounded-md m-4">{serviceError}</p>}
          {serviceResults && (
            <div className="p-4 border-t">
              <h3 className="font-semibold text-lg mb-2 flex items-center"><Bot className="mr-2 h-5 w-5 text-accent" />Recommendations:</h3>
              <Accordion type="single" collapsible className="w-full">
                {serviceResults.recommendations.map((rec, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-medium text-left hover:no-underline">{rec.service}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{rec.reasoning}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </Card>

        <Card className="shadow-lg hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" />Review Sentiment Analysis</CardTitle>
            <CardDescription>Paste customer reviews to identify key topics and overall sentiment.</CardDescription>
          </CardHeader>
           <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(handleReviewAnalysisSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={reviewForm.control}
                  name="reviews"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Reviews</FormLabel>
                      <FormControl><Textarea placeholder="Paste customer reviews here..." {...field} rows={8} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoadingReviews} className="w-full bg-primary hover:bg-primary/90">
                  {isLoadingReviews && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze Reviews
                </Button>
              </CardFooter>
            </form>
          </Form>
          {reviewError && <p className="p-4 text-sm text-destructive bg-destructive/10 rounded-md m-4">{reviewError}</p>}
          {reviewResults && (
            <div className="p-4 border-t">
              <h3 className="font-semibold text-lg mb-2 flex items-center"><Bot className="mr-2 h-5 w-5 text-accent" />Analysis Summary:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reviewResults.summary}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
