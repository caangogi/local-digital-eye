
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Phone, Globe, Star, Tags, Loader2, Save } from 'lucide-react';
import { format, setHours, setMinutes, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Business, SalesStatus } from '@/backend/business/domain/business.entity';
import { useToast } from '@/hooks/use-toast';
import { updateBusinessCrmDetails } from '@/actions/business.actions';

interface BusinessDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business;
}

const salesStatuses: SalesStatus[] = ['new', 'contacted', 'follow_up', 'closed_won', 'closed_lost'];
const statusLabels: { [key in SalesStatus]: string } = {
  new: 'Nuevo Lead',
  contacted: 'Contactado',
  follow_up: 'Seguimiento',
  closed_won: 'Ganado',
  closed_lost: 'Perdido',
};

const crmDetailsSchema = z.object({
  salesStatus: z.enum(salesStatuses),
  notes: z.string().optional(),
  customTags: z.string().optional(),
  nextContactDate: z.date().optional().nullable(),
});

type CrmDetailsFormValues = z.infer<typeof crmDetailsSchema>;

export function BusinessDetailSheet({ isOpen, onOpenChange, business }: BusinessDetailSheetProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CrmDetailsFormValues>({
    resolver: zodResolver(crmDetailsSchema),
    defaultValues: {
      salesStatus: business.salesStatus || 'new',
      notes: business.notes || '',
      customTags: business.customTags?.join(', ') || '',
      nextContactDate: business.nextContactDate ? new Date(business.nextContactDate) : null,
    },
  });

  const onSubmit = async (data: CrmDetailsFormValues) => {
    setIsSaving(true);
    const detailsToUpdate: Partial<Business> = {
      ...data,
      customTags: data.customTags ? data.customTags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };
    
    const response = await updateBusinessCrmDetails(business.id, detailsToUpdate);

    if (response.success) {
      toast({
        title: '¡Guardado!',
        description: `Se han actualizado los datos de "${business.name}".`,
      });
      onOpenChange(false); // Close sheet on success
    } else {
      toast({
        title: 'Error al Guardar',
        description: response.message,
        variant: 'destructive',
      });
    }

    setIsSaving(false);
  };
  
  // Reset form when business changes
  useEffect(() => {
    form.reset({
      salesStatus: business.salesStatus || 'new',
      notes: business.notes || '',
      customTags: business.customTags?.join(', ') || '',
      nextContactDate: business.nextContactDate ? new Date(business.nextContactDate) : null,
    });
  }, [business, form]);
  
  const nextContactDateValue = form.watch('nextContactDate');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-primary">{business.name}</SheetTitle>
          <SheetDescription>
            {business.address}
          </SheetDescription>
          <div className="flex items-center gap-4 text-sm pt-2 text-muted-foreground">
             <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> {business.rating || 'N/A'} ({business.reviewCount || 0})</span>
             {business.phone && <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="w-4 h-4"/> {business.phone}</a>}
             {business.website && <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary truncate"><Globe className="w-4 h-4"/> Website</a>}
          </div>
        </SheetHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col gap-6 overflow-y-auto pr-6">
            {/* Sales Status */}
            <div className="grid gap-2">
                <Label htmlFor="salesStatus">Estado de Venta</Label>
                <Controller
                    control={form.control}
                    name="salesStatus"
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="salesStatus">
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {salesStatuses.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {statusLabels[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" placeholder="Añadir nota sobre el cliente, próxima acción..." {...form.register('notes')} className="min-h-[120px]" />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
                <Label htmlFor="customTags">Etiquetas</Label>
                <Input id="customTags" placeholder="interesado, llamar_lunes, necesita_web" {...form.register('customTags')} />
                <div className="flex flex-wrap gap-1 mt-1">
                    {form.watch('customTags')?.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </div>

            {/* Next Contact Date & Time */}
             <div className="grid gap-2">
                <Label>Fecha y Hora Próximo Contacto</Label>
                 <Controller
                    control={form.control}
                    name="nextContactDate"
                    render={({ field }) => (
                      <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "flex-grow justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={field.value ?? undefined}
                                    onSelect={(date) => {
                                        const originalDate = field.value || new Date();
                                        const newDate = date || originalDate;
                                        const updatedDate = setMinutes(setHours(newDate, originalDate.getHours()), originalDate.getMinutes());
                                        field.onChange(updatedDate);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Select
                            value={field.value ? format(field.value, 'HH') : ''}
                            onValueChange={(hour) => {
                                const newDate = setHours(field.value || new Date(), parseInt(hour));
                                field.onChange(newDate);
                            }}
                             disabled={!field.value}
                        >
                            <SelectTrigger className="w-[80px]"><SelectValue placeholder="Hora" /></SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(hour => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select
                             value={field.value ? format(field.value, 'mm') : ''}
                             onValueChange={(minute) => {
                                 const newDate = setMinutes(field.value || new Date(), parseInt(minute));
                                 field.onChange(newDate);
                             }}
                             disabled={!field.value}
                        >
                             <SelectTrigger className="w-[80px]"><SelectValue placeholder="Min" /></SelectTrigger>
                             <SelectContent>
                                 {['00', '15', '30', '45'].map(min => <SelectItem key={min} value={min}>{min}</SelectItem>)}
                             </SelectContent>
                        </Select>
                      </div>
                    )}
                />
                 {nextContactDateValue && (
                    <p className="text-sm text-muted-foreground">
                        Contacto programado para el: {format(nextContactDateValue, "PPP 'a las' HH:mm", { locale: es })}
                    </p>
                 )}
            </div>


            <SheetFooter className="mt-auto pt-4">
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                Guardar Cambios
              </Button>
            </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
