
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Briefcase, Users, BarChartBig, FileText, PlusCircle, Activity, Eye, Star, MessageSquare } from "lucide-react";
import { Link } from "@/navigation"; // Use next-intl's Link
import Image from "next/image";
import { getTranslations } from 'next-intl/server';
import { SuperAdminButton } from "./_components/SuperAdminButton";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/firebase-admin-config";
import { getOwnedBusiness } from "@/actions/business.actions";
import { TrialCountdownBanner } from "./_components/TrialCountdownBanner";


// This function will determine which dashboard to show based on the user's role
async function getDashboardForRole() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return 'admin'; // Default or handle error

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken.role || 'owner'; // Default to owner if no role
  } catch (e) {
    return 'admin'; // Default on error
  }
}

const AdminDashboard = () => (
  <>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your digital landscape.</p>
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

const OwnerDashboard = async () => {
    const business = await getOwnedBusiness();
    
    return (
      <>
        {business && business.subscriptionStatus === 'trialing' && business.trialEndsAt && (
             <TrialCountdownBanner trialEndsAt={business.trialEndsAt} />
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Tu Panel de Negocio</h1>
            <p className="text-muted-foreground">¡Bienvenido! Aquí tienes un resumen del rendimiento de tu negocio.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/mi-negocio">
              <Briefcase className="mr-2 h-4 w-4" /> Ver mi Perfil Completo
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Visibilidad en Búsquedas" value="1,234" icon={<Eye />} description="+15% este mes" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
            <StatCard title="Valoración Media" value="4.8" icon={<Star />} description="Basado en 125 reseñas" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
            <StatCard title="Nuevas Reseñas" value="8" icon={<MessageSquare />} description="3 esta semana" className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]" />
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
      </>
    )
};


export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar');
  return {
    title: t('dashboard')
  };
}


export default async function DashboardPage() {
  const role = await getDashboardForRole();
  return (
    <div className="flex flex-col gap-6">
      <SuperAdminButton />
      {role === 'owner' ? <OwnerDashboard /> : <AdminDashboard />}
    </div>
  );
}
