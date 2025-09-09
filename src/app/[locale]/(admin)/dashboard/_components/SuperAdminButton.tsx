
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { setUserRole } from '@/actions/user.actions';
import { useToast } from '@/hooks/use-toast';
import { Crown, Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export function SuperAdminButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // This component will only render its content if the user is the designated one and doesn't have the role yet.
  if (!user || user.email !== 'caangogi@gmail.com' || user.role === 'super_admin') {
    return null;
  }

  const handleSetSuperAdmin = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await setUserRole(user.id, 'super_admin');
      if (result.success) {
        toast({
          title: '¡Rol Asignado!',
          description: "Ahora eres Super Admin. Refresca la página para ver todos los cambios.",
          duration: 5000,
        });
        // You might want to force a page reload or a re-authentication to update the user's claims on the client.
        // For now, a manual refresh is okay.
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
     <Alert variant="destructive" className="border-amber-500/50 text-amber-500 dark:border-amber-500 [&>svg]:text-amber-500">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Acción Requerida: Asignación de Rol</AlertTitle>
        <AlertDescription>
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-foreground/90">
                Tu cuenta no tiene un rol de administrador. Haz clic aquí para asignarte el rol de `super_admin` y desbloquear todas las funciones.
            </p>
            <Button onClick={handleSetSuperAdmin} disabled={isLoading} variant="outline" className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto flex-shrink-0">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                Hacerme Super Admin
            </Button>
           </div>
        </AlertDescription>
    </Alert>
  );
}
