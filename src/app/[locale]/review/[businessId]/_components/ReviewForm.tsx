
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from '@/components/ui/input';
import { Star, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Business } from '@/backend/business/domain/business.entity';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { submitNegativeFeedback } from '@/actions/feedback.actions';
import { useToast } from "@/hooks/use-toast";
import { CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


interface ReviewFormProps {
    business: Business;
}

const reviewSchema = z.object({
    rating: z.string().refine(val => parseInt(val) >= 1 && parseInt(val) <= 5, { message: "Por favor, selecciona una calificación." }),
    comment: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email({message: "Por favor, introduce un email válido."}).optional().or(z.literal('')),
}).refine(data => {
    // If rating is < 5, comment must be provided.
    const ratingNum = parseInt(data.rating, 10);
    if (ratingNum < 5) {
        return data.comment && data.comment.length > 10;
    }
    return true;
}, {
    message: "Por favor, déjanos un comentario de al menos 10 caracteres.",
    path: ["comment"],
});

type ReviewFormValues = z.infer<typeof reviewSchema>;


const thankYouMessages = [
    "¡Muchas gracias por tu valoración! 💛\nTus comentarios nos ayudan a mejorar y a seguir sirviendo con el cariño que te mereces. Cada opinión la leemos y la tenemos en cuenta.",
    "Gracias por regalarnos un minuto de tu tiempo 🙏\nTu reseña es un ingrediente esencial para que podamos seguir creciendo y darte siempre el mejor servicio.",
    "¡Tu voz cuenta y mucho! 🌟\nApreciamos de corazón tu comentario. Lo leeremos con atención y aplicaremos todo lo que nos ayude a mejorar.",
    "Tu opinión nos inspira 🍴✨\nCada valoración es una guía para servirte mejor. Gracias por confiar en nosotros y ayudarnos a crecer.",
    "Estamos felices de contar con clientes como tú 💕\nTus comentarios nos motivan a dar lo mejor cada día. Gracias por compartir tu experiencia.",
    "Gracias de corazón por tu reseña 💫\nTus palabras son la mejor recompensa para nuestro equipo. Nos ayudan a mejorar y a seguir sirviendo con pasión.",
    "¡Tu opinión es nuestro motor! 🚀\nCada comentario lo leemos y lo valoramos muchísimo. Gracias por ayudarnos a crecer contigo."
];


export function ReviewForm({ business }: ReviewFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionCompleted, setSubmissionCompleted] = useState(false);
    const [randomMessage, setRandomMessage] = useState('');

    useEffect(() => {
        setRandomMessage(thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)]);
    }, []);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: "0", comment: "", name: "", email: "" }
    });

    const selectedRating = parseInt(form.watch('rating'), 10);

    const handleRatingChange = (value: string) => {
        const rating = parseInt(value, 10);
        form.setValue('rating', value, { shouldValidate: true });
        if (rating === 5) {
            if (business.reviewLink) {
                window.location.href = business.reviewLink;
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo encontrar el enlace de reseña de Google.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleSubmit = async (data: ReviewFormValues) => {
        if (parseInt(data.rating, 10) === 5) return; 
        setIsSubmitting(true);
        try {
            const response = await submitNegativeFeedback({
                businessId: business.id,
                businessName: business.name,
                rating: parseInt(data.rating, 10),
                comment: data.comment || '',
                userName: data.name,
                userEmail: data.email,
            });

            if (response.success) {
                setSubmissionCompleted(true);
            } else {
                toast({ title: "Error al enviar", description: response.message, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error inesperado", description: "Ocurrió un error.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (submissionCompleted) {
        return (
            <div className="text-center p-8 flex flex-col items-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500"/>
                <h3 className="text-xl font-bold text-foreground">¡Gracias por tu feedback!</h3>
                <p className="text-muted-foreground whitespace-pre-line">{randomMessage}</p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardHeader>
                    <CardTitle>Valora tu experiencia</CardTitle>
                    <CardDescription>Queremos conocer tu opinión para seguir mejorando. ¡Gracias por tu tiempo!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>¿Con cuántas estrellas nos valoras?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={handleRatingChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                                {[5, 4, 3, 2, 1].map((ratingValue) => (
                                    <FormItem key={ratingValue} className={cn("flex items-center space-x-3 space-y-0 p-3 rounded-lg border transition-all", selectedRating === ratingValue ? "bg-accent/20 border-accent" : "hover:bg-muted/50", ratingValue === 5 && "border-2 border-amber-400 shadow-lg shadow-amber-500/20")}>
                                         <FormControl>
                                            <RadioGroupItem value={String(ratingValue)} />
                                        </FormControl>
                                        <div className="flex">
                                            {Array.from({ length: ratingValue }).map((_, i) => (
                                                 <Star key={i} className={cn("h-5 w-5", ratingValue === 5 ? "text-amber-400 fill-amber-400" : "text-yellow-400 fill-yellow-400")} />
                                            ))}
                                            {Array.from({ length: 5 - ratingValue }).map((_, i) => (
                                                <Star key={i + ratingValue} className={cn("h-5 w-5", ratingValue === 5 ? "text-amber-400/50" : "text-gray-300")} />
                                            ))}
                                        </div>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedRating > 0 && selectedRating < 5 && (
                        <div className="space-y-4 pt-4 border-t animate-in fade-in-50 duration-500">
                            <p className="text-center text-sm text-muted-foreground">Lamentamos que tu experiencia no haya sido perfecta. Por favor, danos más detalles.</p>
                             <FormField
                                control={form.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tus comentarios</FormLabel>
                                        <FormControl><Textarea placeholder="Cuéntanos qué ha pasado..." {...field} /></FormControl>
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
                                        <FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tu Email (Opcional)</FormLabel>
                                        <FormControl><Input placeholder="tu@email.com" {...field} /></FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </CardContent>
                {selectedRating > 0 && selectedRating < 5 && (
                     <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Comentarios
                         </Button>
                    </CardFooter>
                )}
            </form>
        </Form>
    );
}
