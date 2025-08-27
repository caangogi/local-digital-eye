
"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Link2 } from "lucide-react";

interface CopyReviewLinkProps {
    businessProfileLink: string;
}

export function CopyReviewLink({ businessProfileLink }: CopyReviewLinkProps) {
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(businessProfileLink);
        toast({
            title: "Enlace Copiado",
            description: "El enlace al perfil público del negocio se ha copiado a tu portapapeles.",
        });
    };

    return (
        <DropdownMenuItem onClick={copyToClipboard}>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Copiar enlace del perfil</span>
        </DropdownMenuItem>
    );
}
