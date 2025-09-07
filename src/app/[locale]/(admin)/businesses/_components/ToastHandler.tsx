
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation'; // Import the router from our navigation utilities

export function ToastHandler() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Get router instance
    const { toast } = useToast();

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const businessName = searchParams.get('business_name');
        const errorDescription = searchParams.get('error_description');

        if (success === 'oauth_completed' && businessName) {
            toast({
                title: "¡Conexión Exitosa!",
                description: `El perfil de Google para "${businessName}" ha sido verificado y conectado correctamente.`,
                variant: 'default',
            });
            // This is the key change: refresh server components to get new data
            router.refresh(); 
             // Clean up URL to avoid re-triggering toast on refresh
             window.history.replaceState(null, '', window.location.pathname);
        }

        if (error) {
            toast({
                title: "Error en la Conexión de Google",
                description: errorDescription || "Ha ocurrido un error desconocido durante el proceso de autorización.",
                variant: 'destructive',
            });
             // Clean up URL
             window.history.replaceState(null, '', window.location.pathname);
        }

    }, [searchParams, toast, router]);

    return null; // This component does not render anything
}

    