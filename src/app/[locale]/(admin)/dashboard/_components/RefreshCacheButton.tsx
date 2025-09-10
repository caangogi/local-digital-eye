
"use client";

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { refreshBusinessDataCache } from '@/actions/business.actions';
import { differenceInHours } from 'date-fns';

interface RefreshCacheButtonProps {
    businessId: string;
    lastUpdateTime: Date | null | undefined;
    onRefreshComplete: (data: any) => void;
}

export function RefreshCacheButton({ businessId, lastUpdateTime, onRefreshComplete }: RefreshCacheButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleRefresh = () => {
        startTransition(async () => {
            const result = await refreshBusinessDataCache(businessId);
            if (result.success) {
                toast({
                    title: "¡Datos Refrescados!",
                    description: "Las métricas de tu negocio han sido actualizadas.",
                });
                if(result.rawData) {
                    onRefreshComplete(result.rawData);
                }
            } else {
                toast({
                    title: "Error al refrescar",
                    description: result.message,
                    variant: "destructive",
                });
                 onRefreshComplete(null);
            }
        });
    };

    const now = new Date();
    const hoursSinceLastUpdate = lastUpdateTime ? differenceInHours(now, lastUpdateTime) : 25;
    const canRefresh = hoursSinceLastUpdate >= 24;

    return (
        <Button onClick={handleRefresh} disabled={isPending || !canRefresh} variant="outline" size="sm">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refrescar Datos
        </Button>
    );
}
