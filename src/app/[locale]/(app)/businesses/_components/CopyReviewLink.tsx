"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Link } from "lucide-react";

interface CopyReviewLinkProps {
    reviewLink: string;
}

export function CopyReviewLink({ reviewLink }: CopyReviewLinkProps) {
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(reviewLink);
        toast({
            title: "Enlace Copiado",
            description: "El enlace de reseña se ha copiado a tu portapapeles.",
        });
    };

    return (
        <DropdownMenuItem onClick={copyToClipboard}>
            <Link className="mr-2 h-4 w-4" />
            <span>Copiar enlace de reseña</span>
        </DropdownMenuItem>
    );
}
