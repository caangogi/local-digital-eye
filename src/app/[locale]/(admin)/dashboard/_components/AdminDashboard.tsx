
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Briefcase, Users, BarChartBig, FileText, PlusCircle } from "lucide-react";
import { Link } from "@/navigation";
import Image from "next/image";

export function AdminDashboard() {
    return (
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
}
