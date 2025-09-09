
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { setUserRole } from '@/actions/user.actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Users, Crown } from 'lucide-react';
import { Link } from '@/navigation';

export function AdminTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // This component will only render its content if the user is a super_admin
  if (user?.role !== 'super_admin') {
    return <p className="text-sm text-muted-foreground">You do not have permission to view these tools.</p>;
  }

  const handleSetSuperAdmin = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await setUserRole(user.id, 'super_admin');
      if (result.success) {
        toast({
          title: 'Success!',
          description: "You have been promoted to Super Admin. Please refresh the page to see the changes.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-md flex items-center gap-2"><Crown className="text-amber-500"/>First-Time Setup</h4>
            <p className="text-xs text-muted-foreground">
                This is a temporary button for initial setup. Click it to grant your current account (`{user.email}`) full system privileges. This action only needs to be done once.
            </p>
             <Button onClick={handleSetSuperAdmin} disabled={isLoading} variant="destructive">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Make me Super Admin
            </Button>
        </div>
       
        <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-md flex items-center gap-2"><Users /> User Management</h4>
            <p className="text-xs text-muted-foreground">
                Go to the user management panel to view all registered users and assign roles like 'admin'.
            </p>
            <Button asChild variant="outline">
                <Link href="/settings/users">
                    <Users className="mr-2 h-4 w-4" /> Go to User Management
                </Link>
            </Button>
        </div>
    </div>
  );
}
