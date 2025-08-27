"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input';
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Business } from '@/backend/business/domain/business.entity';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ReviewFormProps {
    business: Business;
}

const reviewSchema = z.object({
    rating: z.number().min(1, "Por favor, selecciona una calificación.").max(5),
    comment: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email("Por favor, introduce un email válido.").optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;


export function ReviewForm({ business }: ReviewFormProps) {
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
            name: "",
            email: ""
        }
    });

    const selectedRating = form.watch('rating');

    const handleSubmit = (data: ReviewFormValues) => {
        if (data.rating === 5) {
            window.location.href = business.reviewLink;
        } else {
            // Logic to submit negative feedback will be implemented in the next step.
            console.log("Submitting negative feedback:", data);
            alert("Gracias por tu feedback. Lo hemos recibido y nos pondremos en contacto pronto.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                 <Controller
                    name="rating"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                            <FormLabel className="text-base mb-4">¿Cómo calificarías tu experiencia?</FormLabel>
                            <FormControl>
                                <div 
                                    className="flex items-center gap-2"
                                    onMouseLeave={() => setHoveredRating(null)}
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "w-10 h-10 cursor-pointer transition-all duration-200",
                                                (hoveredRating ?? selectedRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                            )}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onClick={() => field.onChange(star)}
                                        />
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage className="mt-2" />
                        </FormItem>
                    )}
                />

                {selectedRating > 0 && selectedRating < 5 && (
                    <div className="space-y-4 p-4 border bg-muted/50 rounded-lg animate-in fade-in-50 duration-500">
                        <p className="text-center text-sm text-muted-foreground">Lamentamos que tu experiencia no haya sido perfecta. Por favor, danos más detalles para poder mejorar.</p>
                         <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tus comentarios</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Cuéntanos qué ha pasado..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Nombre (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="tu@email.com" {...field} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" className="w-full">Enviar Comentarios</Button>
                    </div>
                )}

                 {selectedRating === 5 && (
                    <div className="text-center p-4 border bg-green-500/10 border-green-500/20 rounded-lg animate-in fade-in-50 duration-500">
                        <p className="text-green-700 dark:text-green-300 font-semibold mb-2">¡Nos alegra que hayas tenido una gran experiencia!</p>
                        <p className="text-sm text-muted-foreground mb-4">Para ayudarnos a crecer, ¿te importaría dejar esta reseña en Google? Solo te tomará un minuto.</p>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Continuar a Google</Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
