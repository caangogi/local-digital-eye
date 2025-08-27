"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Share2 } from "lucide-react";
import { getGoogleOAuthConsentUrl } from "@/actions/oauth.actions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ConnectGoogleProfileProps {
    businessId: string;
}

export function ConnectGoogleProfile({ businessId }: ConnectGoogleProfileProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const url = await getGoogleOAuthConsentUrl(businessId);
            // Redirect the user to the consent screen
            window.location.href = url;
        } catch (error: any) {
            console.error("Failed to get Google OAuth URL", error);
            toast({
                title: "Error de Conexión",
                description: "No se pudo iniciar la conexión con Google. " + error.message,
                variant: "destructive",
            });
            setIsLoading(false);
        }
        // No need to setIsLoading(false) on success, as the page will redirect.
    };

    return (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleConnect} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            <span>Conectar Perfil de Google</span>
        </DropdownMenuItem>
    );
}
