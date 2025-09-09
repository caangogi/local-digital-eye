
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserList, type SerializableUser } from "./_components/UserList";
import { listAllUsers } from "@/actions/user.actions";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: `User Management | ${t('settings')}`
  };
}

export default async function UserManagementPage() {
    let users: SerializableUser[] = [];
    let error: string | null = null;
    try {
        const userRecords = await listAllUsers();
        // Convert complex UserRecord objects to plain, serializable objects
        users = userRecords.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            emailVerified: u.emailVerified,
            // Ensure customClaims is serializable
            customClaims: u.customClaims ? JSON.parse(JSON.stringify(u.customClaims)) : undefined,
            metadata: {
                creationTime: u.metadata.creationTime,
            },
        }));
    } catch (e: any) {
        error = e.message;
    }

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
                <p className="text-muted-foreground">View and manage all users in the system.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        A list of all users registered in Firebase Authentication. You can manage their roles from here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Access Denied</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    ) : (
                       <UserList initialUsers={users} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
