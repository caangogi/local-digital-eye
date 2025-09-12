
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Briefcase, Users, BarChartBig, FileText, PlusCircle, Activity, Eye, Star, QrCode, Link2, MessageSquare } from "lucide-react";
import { Link } from "@/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import { SuperAdminButton } from "./_components/SuperAdminButton";
import { useAuth } from "@/hooks/useAuth";
import type { Business } from '@/backend/business/domain/business.entity';
import { TrialCountdownBanner } from "./_components/TrialCountdownBanner";
import { RefreshCacheButton } from "./_components/RefreshCacheButton";
import { DebugCollapse } from '@/components/dev/DebugCollapse';
import { getOwnedBusiness } from '@/actions/business.actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, Download, Copy } from 'lucide-react';

// This function will determine which dashboard to show based on the user's role
function getDashboardForRole(role: string | undefined) {
  return role || 'owner'; // Default to owner if no role
}

const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        ))}
    </div>
);

const AdminDashboard = () => (
  <>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your digital landscape.</p>
      </div>
      <Link href="/businesses/add">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Business
        </Button>
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Businesses Analyzed" value="12" icon={<Briefcase />} description="+2 since last week" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
      <StatCard title="Average Score" value="78/100" icon={<BarChartBig />} description="Slightly improved" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
      <StatCard title="Competitors Tracked" value="45" icon={<Users />} description="Across all businesses" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
      <StatCard title="Reports Generated" value="8" icon={<FileText />} description="Last report: 'The Cozy Cafe'" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
    </div>
    <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-headline">Performance Overview</CardTitle>
          <CardDescription>Key metrics trend over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] bg-card rounded-md flex items-center justify-center">
            <Image src="https://picsum.photos/600/300" alt="Performance Chart Placeholder" width={600} height={300} className="rounded-md object-cover" data-ai-hint="line graph analytics dark"/>
          </div>
        </CardContent>
      </Card>
  </>
);

interface OwnerDashboardProps {
    business: Business;
}
const OwnerDashboard = ({ business }: OwnerDashboardProps) => {
    const [debugData, setDebugData] = useState<any>(null);
    const { toast } = useToast();
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

    const gmbInsights = business?.gmbInsightsCache || { totalViews: 0, totalActions: 0 };
    const rating = business?.rating || 0;
    const reviewCount = business?.reviewCount || 0;
    const profileLink = `${process.env.NEXT_PUBLIC_BASE_URL}/negocio/${business.id}`;
    
    const copyToClipboard = (textToCopy: string, successMessage: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({
          title: "¡Copiado!",
          description: successMessage,
        });
    };

    const generateWhatsAppMessage = () => {
        const message = `¡Hola! Nos encantaría conocer tu opinión sobre tu reciente experiencia con nosotros en ${business.name}. Tu feedback es muy valioso.\n\nPuedes dejarnos una reseña en nuestro perfil de Google aquí:\n${profileLink}\n\n¡Muchas gracias!`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };
    
    const generateQRCode = async () => {
        if (qrCodeDataUrl) return;
        try {
          const dataUrl = await QRCode.toDataURL(profileLink, { width: 400, margin: 2, errorCorrectionLevel: 'H' });
          setQrCodeDataUrl(dataUrl);
        } catch (err) {
          console.error("Failed to generate QR code", err);
          toast({ title: "Error", description: "No se pudo generar el código QR.", variant: "destructive" });
        }
    };

    const handleOpenQrModal = () => {
        generateQRCode();
        setIsQrModalOpen(true);
    };

    const handleDownloadQr = () => {
        const link = document.createElement("a");
        link.href = qrCodeDataUrl;
        link.download = `qr-perfil-${business.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
      <div className="flex flex-col gap-6">
        {business.subscriptionStatus === 'trialing' && business.trialEndsAt && (
             <TrialCountdownBanner trialEndsAt={business.trialEndsAt} />
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de {business.name}</h1>
            <p className="text-muted-foreground">¡Bienvenido! Aquí tienes un resumen del rendimiento y herramientas para tu negocio.</p>
          </div>
          {business && (
              <RefreshCacheButton 
                businessId={business.id} 
                lastUpdateTime={business.gmbInsightsCache?.lastUpdateTime}
                onRefreshComplete={setDebugData}
              />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Main Stats */}
            <StatCard title="Visibilidad Total" value={gmbInsights.totalViews?.toLocaleString() ?? 'N/A'} icon={<Eye />} description="Vistas en Búsqueda y Mapas" className="shadow-md" />
            <StatCard title="Interacciones" value={gmbInsights.totalActions?.toLocaleString() ?? 'N/A'} icon={<Activity />} description="Clics a web, teléfono, cómo llegar" className="shadow-md" />
            <StatCard title="Reputación" value={`${rating}/5`} icon={<Star />} description={`Basado en ${reviewCount} reseñas`} className="shadow-md" />

            {/* Review Tools */}
            <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Herramientas para conseguir reseñas</CardTitle>
                    <CardDescription>Usa estos botones para pedir opiniones a tus clientes.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleOpenQrModal} className="flex-1" variant="outline"><QrCode className="mr-2 h-4 w-4"/> Generar Código QR</Button>
                    <a href={generateWhatsAppMessage()} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full"><MessageSquare className="mr-2 h-4 w-4"/> Compartir por WhatsApp</Button>
                    </a>
                    <Button onClick={() => copyToClipboard(profileLink, 'Enlace copiado al portapapeles.')} className="flex-1" variant="outline"><Link2 className="mr-2 h-4 w-4"/> Copiar Enlace Directo</Button>
                </CardContent>
            </Card>

             {business.topReviews && business.topReviews.length > 0 && (
                <Card className="md:col-span-2 lg:col-span-3">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star/> Últimas Reseñas Públicas</CardTitle>
                        <CardDescription>Las mejores y más recientes opiniones de tus clientes en Google.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {business.topReviews.slice(0, 4).map((review, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-muted/50">
                                 <div className="flex items-center gap-3 mb-2">
                                    {review.profilePhotoUrl && <Image src={review.profilePhotoUrl} alt={review.authorName} width={40} height={40} className="rounded-full"/>}
                                    <div>
                                        <p className="font-semibold">{review.authorName}</p>
                                        <StarRating rating={review.rating} />
                                    </div>
                                 </div>
                                 <p className="text-sm text-muted-foreground italic line-clamp-3">"{review.text}"</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
        
         <footer className="mt-8 space-y-4">
            {debugData && (
                <DebugCollapse title="Respuesta Completa de Google (Refresco Manual)" data={debugData} />
            )}
        </footer>

        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Código QR para {business.name}</DialogTitle>
                <DialogDescription>Los clientes pueden escanear este código para visitar tu perfil público y dejar una reseña.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center p-4 bg-white rounded-md my-4">
                {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt={`Código QR para ${business.name}`} className="w-64 h-64" /> : <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
            </div>
            <DialogFooter className="sm:justify-end gap-2">
                 <Button onClick={handleDownloadQr} disabled={!qrCodeDataUrl}><Download className="mr-2 h-4 w-4" /> Descargar PNG</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    )
};

const OwnerDashboardSkeleton = () => (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36" />
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
    </div>
);


// This is now a client component to manage state
export default function DashboardPage() {
  const { user } = useAuth();
  const [ownedBusiness, setOwnedBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user?.role === 'owner') {
        const fetchBusiness = async () => {
            setIsLoading(true);
            const business = await getOwnedBusiness();
            setOwnedBusiness(business);
            setIsLoading(false);
        };
        fetchBusiness();
    } else {
        setIsLoading(false);
    }
  }, [user]);
  
  const role = getDashboardForRole(user?.role);

  return (
    <div className="flex flex-col gap-6">
      <SuperAdminButton />
      {isLoading ? (
        <OwnerDashboardSkeleton />
      ) : role === 'owner' ? (
        ownedBusiness ? (
          <OwnerDashboard business={ownedBusiness} />
        ) : (
          <p>No business linked to this account.</p> // Or a more detailed component
        )
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}
