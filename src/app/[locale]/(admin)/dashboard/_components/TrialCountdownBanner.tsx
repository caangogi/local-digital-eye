
"use client";

import { useState, useEffect } from 'react';
import { differenceInDays, format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Timer, ArrowRight, XCircle } from 'lucide-react';
import { Link } from '@/navigation';

interface TrialCountdownBannerProps {
    trialEndsAt: Date;
}

export function TrialCountdownBanner({ trialEndsAt }: TrialCountdownBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    const now = new Date();
    const daysRemaining = differenceInDays(trialEndsAt, now);
    const hasExpired = isPast(trialEndsAt);

    if (!isVisible) {
        return null;
    }

    if (hasExpired) {
        return (
            <Alert variant="destructive">
                <Timer className="h-4 w-4" />
                <AlertTitle className="font-bold">Tu periodo de prueba ha finalizado</AlertTitle>
                <div className="flex items-center justify-between">
                    <AlertDescription>
                        Para seguir disfrutando de todas las funcionalidades, por favor, actualiza a un plan superior.
                    </AlertDescription>
                    <div className="flex items-center gap-4">
                        <Button asChild size="sm">
                            <Link href="/settings/billing">Ver Planes <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(false)}>
                            <XCircle className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </Alert>
        );
    }
    
    return (
        <Alert className="bg-primary/10 border-primary/30 text-primary-foreground">
             <Timer className="h-4 w-4 text-primary" />
            <AlertTitle className="font-bold text-primary">¡Bienvenido a tu prueba gratuita!</AlertTitle>
            <div className="flex items-center justify-between">
                <AlertDescription className="text-primary/90">
                    {daysRemaining > 1 ? `Te quedan ${daysRemaining} días de prueba.` : '¡Tu prueba termina hoy!'}
                    {' '}Tu prueba finaliza el {format(trialEndsAt, "dd 'de' MMMM 'de' yyyy", { locale: es })}.
                </AlertDescription>
                <div className="flex items-center gap-4">
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                        <Link href="/settings/billing">Actualizar Plan <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20" onClick={() => setIsVisible(false)}>
                        <XCircle className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </Alert>
    )
}
