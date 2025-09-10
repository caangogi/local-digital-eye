
"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Briefcase, Users, BarChartBig, FileText, PlusCircle, Activity, Eye, Star } from "lucide-react";
import { Link } from "@/navigation"; // Use next-intl's Link
import Image from "next/image";
import { SuperAdminButton } from "./_components/SuperAdminButton";
import { useAuth } from "@/hooks/useAuth";
import type { Business } from '@/backend/business/domain/business.entity';
import { TrialCountdownBanner } from "./_components/TrialCountdownBanner";
import { RefreshCacheButton } from "./_components/RefreshCacheButton";
import { DebugCollapse } from '@/components/dev/DebugCollapse';


// This function will determine which dashboard to show based on the user's role
function getDashboardForRole(role: string | undefined) {
  return role || 'owner'; // Default to owner if no role
}

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
    business: Business | null; // Pass the business object as a prop
}
const OwnerDashboard = ({ business }: OwnerDashboardProps) => {
    const [debugData, setDebugData] = useState<any>(null);
    
    // Default values for the cache in case it's null
    const gmbInsights = business?.gmbInsightsCache || { totalViews: 0, totalActions: 0 };
    const rating = business?.rating || 0;
    const reviewCount = business?.reviewCount || 0;


    return (
      <div className="flex flex-col gap-6">
        {business && business.subscriptionStatus === 'trialing' && business.trialEndsAt && (
             <TrialCountdownBanner trialEndsAt={business.trialEndsAt} />
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Tu Panel de Negocio</h1>
            <p className="text-muted-foreground">¡Bienvenido! Aquí tienes un resumen del rendimiento de tu negocio.</p>
          </div>
          <div className="flex items-center gap-2">
            {business && (
              <RefreshCacheButton 
                businessId={business.id} 
                lastUpdateTime={business.gmbInsightsCache?.lastUpdateTime}
                onRefreshComplete={setDebugData}
              />
            )}
            <Button asChild variant="outline">
              <Link href="/mi-negocio">
                <Briefcase className="mr-2 h-4 w-4" /> Ver mi Perfil Completo
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Visibilidad Total" value={gmbInsights.totalViews?.toLocaleString() ?? 'N/A'} icon={<Eye />} description="Vistas en Búsqueda y Mapas" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
            <StatCard title="Interacciones" value={gmbInsights.totalActions?.toLocaleString() ?? 'N/A'} icon={<Activity />} description="Clics a web, teléfono, cómo llegar" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
            <StatCard title="Reputación" value={`${rating}/5`} icon={<Star />} description={`Basado en ${reviewCount} reseñas`} className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
        </div>
         <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-headline">Resumen de Rendimiento</CardTitle>
              <CardDescription>Evolución de tus métricas clave en los últimos 30 días.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] bg-card rounded-md flex items-center justify-center">
                <Image src="https://picsum.photos/seed/owner/600/300" alt="Performance Chart Placeholder" width={600} height={300} className="rounded-md object-cover" data-ai-hint="line chart analytics modern" />
              </div>
            </CardContent>
          </Card>
        
         <footer className="mt-8 space-y-4">
            {debugData && (
                <DebugCollapse title="Respuesta Completa de Google (Refresco Manual)" data={debugData} />
            )}
        </footer>
      </div>
    )
};


// This is now a client component to manage state
export default function DashboardPage() {
  const { user } = useAuth();
  const [ownedBusiness, setOwnedBusiness] = useState<Business | null>(null);
  
  // You would fetch the business data here, for example in a useEffect
  // For now, we'll just simulate it. This should be replaced with a proper
  // server action call like `getOwnedBusiness()`
  // Note: This part needs to be adapted to fetch data for real.
  // The original server component logic is now moved inside a client component structure.
  
  const role = getDashboardForRole(user?.role);

  return (
    <div className="flex flex-col gap-6">
      <SuperAdminButton />
      {role === 'owner' ? <OwnerDashboard business={ownedBusiness} /> : <AdminDashboard />}
    </div>
  );
}
