import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Briefcase, Users, BarChartBig, FileText, PlusCircle, Activity } from "lucide-react";
import { Link } from "@/navigation"; // Use next-intl's Link
import Image from "next/image";
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  // Assuming you have a 'DashboardPage' namespace in your translation files
  const t = await getTranslations('AppSidebar'); // Or a specific Dashboard namespace
  return {
    title: t('dashboard')
  };
}

// Mock data for recent activity
const recentActivity = [
  { id: 1, text: "Analysis completed for 'The Cozy Cafe'", time: "2 hours ago", icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 2, text: "New competitor 'Modern Brews' identified for 'The Cozy Cafe'", time: "3 hours ago", icon: <Users className="h-4 w-4 text-primary" /> },
  { id: 3, text: "'Sunnydale Bakery' re-analysis scheduled for tomorrow", time: "1 day ago", icon: <Activity className="h-4 w-4 text-primary" /> },
];


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your digital landscape.</p>
        </div>
        <Link href="/businesses/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Business
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Businesses Analyzed"
          value="12"
          icon={<Briefcase />}
          description="+2 since last week"
          className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]"
        />
        <StatCard
          title="Average Score"
          value="78/100"
          icon={<BarChartBig />}
          description="Slightly improved"
          className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]"
        />
        <StatCard
          title="Competitors Tracked"
          value="45"
          icon={<Users />}
          description="Across all businesses"
          className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]"
        />
        <StatCard
          title="Reports Generated"
          value="8"
          icon={<FileText />}
          description="Last report: 'The Cozy Cafe'"
          className="shadow-md hover:shadow-lg transition-shadow hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.2)]"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Performance Overview</CardTitle>
            <CardDescription>Key metrics trend over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] bg-card rounded-md flex items-center justify-center">
              <Image 
                src="https://picsum.photos/600/300" 
                alt="Performance Chart Placeholder" 
                width={600} 
                height={300}
                className="rounded-md object-cover"
                data-ai-hint="line graph analytics dark"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Latest updates and analyses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivity.map(activity => (
                <li key={activity.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="p-2 bg-secondary rounded-full mt-1 ring-1 ring-accent/20">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
