
import { getBusinessDetails } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "./_components/ReviewForm";


export default async function PublicReviewPage({ params }: { params: { businessId: string, locale: string } }) {
    
    const business = await getBusinessDetails(params.businessId);

    if (!business) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <Card className="shadow-2xl border-border/50">
                    <CardHeader className="items-center text-center">
                        <Image 
                            src="https://picsum.photos/80"
                            alt={`Logo de ${business.name}`}
                            width={80}
                            height={80}
                            className="rounded-full mb-4 border-2 border-primary/50 p-1"
                            data-ai-hint="logo business"
                        />
                        <CardDescription className="text-lg">Tu opinión es importante para</CardDescription>
                        <CardTitle className="text-3xl font-headline text-primary">{business.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ReviewForm business={business} />
                    </CardContent>
                </Card>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    Potenciado por Local Digital Eye
                </p>
            </div>
        </div>
    );
}
