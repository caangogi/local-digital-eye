
"use client";

import { useState, useEffect } from 'react';
import { differenceInDays, format, isPast, differenceInMilliseconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Timer, ArrowRight, XCircle } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface TrialCountdownBannerProps {
    trialEndsAt: Date | null | undefined;
}

const calculateTimeLeft = (endDate: Date) => {
    const difference = differenceInMilliseconds(endDate, new Date());
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }
    return timeLeft;
};

export function TrialCountdownBanner({ trialEndsAt }: TrialCountdownBannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState(trialEndsAt ? calculateTimeLeft(trialEndsAt) : null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        // Handle payment success toast and refresh
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            toast({
                title: "¡Pago completado!",
                description: "Tu suscripción ha sido activada correctamente. ¡Bienvenido!",
                variant: 'default',
            });
            router.refresh();
            // Clean up URL to avoid re-triggering toast on refresh
            window.history.replaceState(null, '', window.location.pathname);
        } else if (paymentStatus === 'cancelled') {
             toast({
                title: "Pago cancelado",
                description: "El proceso de pago fue cancelado. Puedes intentarlo de nuevo desde la página de facturación.",
                variant: 'destructive',
            });
            router.refresh();
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [searchParams, toast, router]);


    useEffect(() => {
        if (!trialEndsAt) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(trialEndsAt));
        }, 1000);

        return () => clearInterval(timer);
    }, [trialEndsAt]);

    if (!isVisible || !trialEndsAt || !timeLeft) {
        return null;
    }

    const hasExpired = isPast(trialEndsAt);

    if (hasExpired) {
        return (
            <Alert variant="destructive">
                <Timer className="h-4 w-4" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <AlertTitle className="font-bold">Tu periodo de prueba ha finalizado</AlertTitle>
                        <AlertDescription>
                            Para seguir disfrutando de todas las funcionalidades, por favor, actualiza a un plan superior.
                        </AlertDescription>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-grow space-y-2">
                    <AlertTitle className="font-bold text-primary">¡Bienvenido a tu prueba gratuita!</AlertTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <AlertDescription className="text-primary/90">
                            Tu prueba finaliza el {format(trialEndsAt, "dd 'de' MMMM 'de' yyyy", { locale: es })}.
                        </AlertDescription>
                        <div className="flex items-center gap-2 font-mono text-sm text-primary/90 font-semibold mt-1 sm:mt-0">
                            <div className="flex flex-col items-center p-1 rounded-md min-w-[40px]"><span>{String(timeLeft.days).padStart(2, '0')}</span><span className="text-xs opacity-70">días</span></div>
                            <div className="flex flex-col items-center p-1 rounded-md min-w-[40px]"><span>{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-xs opacity-70">hrs</span></div>
                            <div className="flex flex-col items-center p-1 rounded-md min-w-[40px]"><span>{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-xs opacity-70">min</span></div>
                            <div className="flex flex-col items-center p-1 rounded-md min-w-[40px]"><span>{String(timeLeft.seconds).padStart(2, '0')}</span><span className="text-xs opacity-70">seg</span></div>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-4 self-end sm:self-center">
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
