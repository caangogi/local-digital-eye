import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search } from "lucide-react";
import Image from "next/image";
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar');
  return {
    title: t('reports')
  };
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Reports</h1>
          <p className="text-muted-foreground">Access and manage your generated business analysis reports.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <FileText className="mr-2 h-4 w-4" /> Generate New Report
        </Button>
      </div>

      <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-headline">Generated Reports</CardTitle>
          <CardDescription>Search and download past reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="Search reports by business name or date..." className="pl-10 w-full p-2 border border-border rounded-md" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
          
          <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/50">
            <Image 
              src="https://placehold.co/800x400.png" 
              alt="Reports Section Placeholder" 
              width={800} 
              height={400}
              className="rounded-md mx-auto shadow-sm"
              data-ai-hint="document list report"
            />
            <p className="text-muted-foreground">Your generated reports will appear here.</p>
            <p className="text-sm">Currently, report generation is under development. Check back soon!</p>
            <Button variant="secondary" disabled>
              <Download className="mr-2 h-4 w-4" /> Download Sample Report (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
