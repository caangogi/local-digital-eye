
import { getBusinessDetails } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "../../review/[businessId]/_components/ReviewForm";
import { Star, Phone, Globe, Clock, MapPin, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Helper component to render stars
const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
          {halfStar && <Star key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={`empty-${i}`} className="h-5 w-5 text-gray-400" />
          ))}
        </div>
        <span className="text-muted-foreground text-sm">({rating.toFixed(1)} de {reviewCount} reseñas)</span>
      </div>
    );
};


export default async function BusinessPublicProfilePage({ params }: { params: { businessId: string } }) {
    
    const business = await getBusinessDetails(params.businessId);

    if (!business) {
        notFound();
    }
    
    // Construct a simple map embed URL.
    // NOTE: This requires the "Embed API" to be enabled in Google Cloud.
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${business.placeId}`;
    
    // Use picsum for placeholder logo if no photo exists
    const logoUrl = business.photos && business.photos.length > 0 
        ? `https://places.googleapis.com/v1/${business.photos[0].name}/media?maxHeightPx=200&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        : `https://picsum.photos/seed/${business.id}/100`;

    const coverPhotoUrl = business.photos && business.photos.length > 1
        ? `https://places.googleapis.com/v1/${business.photos[1].name}/media?maxHeightPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        : "https://picsum.photos/seed/cover/1200/400"

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="container mx-auto p-4 sm:p-8">
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <Card className="overflow-hidden shadow-lg">
                            <div className="h-48 bg-gray-200 relative">
                                <Image 
                                    src={coverPhotoUrl}
                                    alt={`${business.name} cover image`}
                                    fill
                                    objectFit="cover"
                                    data-ai-hint="business cover"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                            <CardHeader className="relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-gradient-to-t from-card via-card/80 to-transparent pt-12 p-6">
                               <Image 
                                    src={logoUrl}
                                    alt={`Logo de ${business.name}`}
                                    width={100}
                                    height={100}
                                    className="rounded-full border-4 border-card shadow-lg bg-white"
                                    data-ai-hint="business logo"
                                />
                                <div className="flex-1">
                                    <Badge variant="secondary" className="mb-2">{business.category?.replace(/_/g, ' ')}</Badge>
                                    <CardTitle className="text-4xl font-headline">{business.name}</CardTitle>
                                    {business.rating && business.reviewCount && (
                                        <div className="mt-2">
                                          <StarRating rating={business.rating} reviewCount={business.reviewCount} />
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Review Form Card */}
                        <Card className="shadow-lg" id="review-section">
                             <CardHeader>
                                <CardTitle>Deja tu opinión</CardTitle>
                                <CardDescription>Tu feedback nos ayuda a mejorar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <ReviewForm business={business} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Info Card */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {business.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-1"/>
                                        <span>{business.address}</span>
                                    </div>
                                )}
                                {business.phone && (
                                     <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-1"/>
                                        <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                                    </div>
                                )}
                                {business.website && (
                                     <div className="flex items-start gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground mt-1"/>
                                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{business.website}</a>
                                    </div>
                                )}
                                {business.openingHours?.weekdayDescriptions && (
                                    <div className="flex items-start gap-3 pt-2">
                                        <Clock className="h-5 w-5 text-muted-foreground mt-1"/>
                                        <ul className="space-y-1">
                                            {business.openingHours.weekdayDescriptions.map((day, i) => <li key={i}>{day}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* Map Card */}
                        <Card className="shadow-lg">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MapPin className="text-primary"/> Ubicación</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <iframe
                                    className="w-full h-64 rounded-md border"
                                    loading="lazy"
                                    allowFullScreen
                                    src={mapEmbedUrl}>
                                </iframe>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                 <footer className="text-center text-xs text-muted-foreground mt-12">
                    Potenciado por Local Digital Eye
                </footer>
            </div>
        </div>
    );
}

    