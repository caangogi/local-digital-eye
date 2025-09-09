
import { getOwnedBusiness } from "@/actions/business.actions";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building } from "lucide-react";

export default async function MyBusinessPage() {
    const business = await getOwnedBusiness();

    if (!business) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>No Business Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            We couldn't find a business linked to your account. Please contact support if you believe this is an error.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
                    <Building className="h-8 w-8 text-primary"/>
                    {business.name}
                </h1>
                <p className="text-muted-foreground">Este es el panel de control para tu negocio.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to your Business Hub!</CardTitle>
                    <CardDescription>This page will soon contain all the analytics and tools for managing your online presence.</CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                        <code>
                            {JSON.stringify(business, null, 2)}
                        </code>
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
