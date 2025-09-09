
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarPlus } from "lucide-react";
import { extendBusinessTrial } from '@/actions/business.actions';

interface ExtendTrialDialogProps {
  businessId: string;
  businessName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const extendTrialSchema = z.object({
  days: z.coerce.number().int().min(1, "Debe añadir al menos 1 día.").max(365, "No se pueden añadir más de 365 días."),
});

type ExtendTrialFormValues = z.infer<typeof extendTrialSchema>;

export function ExtendTrialDialog({ businessId, businessName, isOpen, onOpenChange }: ExtendTrialDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ExtendTrialFormValues>({
    resolver: zodResolver(extendTrialSchema),
    defaultValues: { days: 7 },
  });

  const onSubmit = async (data: ExtendTrialFormValues) => {
    setIsSubmitting(true);
    try {
        const response = await extendBusinessTrial(businessId, data.days);
        if (response.success) {
            toast({
                title: "¡Prueba Extendida!",
                description: `El periodo de prueba para "${businessName}" ha sido extendido por ${data.days} días.`,
            });
            onOpenChange(false); // Close dialog on success
        } else {
            throw new Error(response.message);
        }
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "No se pudo extender el periodo de prueba.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extender Prueba para {businessName}</DialogTitle>
          <DialogDescription>
            Añada días adicionales al periodo de prueba gratuito de este negocio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="days">Días a Añadir</Label>
                <Input
                    id="days"
                    type="number"
                    {...form.register('days')}
                />
                 {form.formState.errors.days && (
                    <p className="text-sm text-destructive">{form.formState.errors.days.message}</p>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
                    Confirmar Extensión
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
