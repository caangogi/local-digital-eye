
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Users, Crown } from 'lucide-react';
import { Link } from '@/navigation';

export function AdminTools() {
  const { user } = useAuth();

  // This component will only render its content if the user is a super_admin
  if (user?.role !== 'super_admin') {
    return <p className="text-sm text-muted-foreground">You do not have permission to view these tools.</p>;
  }

  return (
    <div className="space-y-4">
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
