
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
            <div className="text-center p-8 flex flex-col items-center gap-4 text-white">
                <CheckCircle className="w-16 h-16 text-green-400"/>
                <h3 className="text-xl font-bold">¡Gracias por tu feedback!</h3>
                <p className="text-slate-300 whitespace-pre-line">{randomMessage}</p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardHeader className="text-white">
                    <CardTitle className="text-2xl">Valora tu experiencia</CardTitle>
                    <CardDescription className="text-slate-300">Queremos conocer tu opinión para seguir mejorando. ¡Gracias por tu tiempo!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="sr-only">¿Con cuántas estrellas nos valoras?</FormLabel>
                          <FormControl>
                             {/* Remove RadioGroup and replace with styled buttons */}
                            <div className="flex flex-col space-y-2">
                                {[5, 4, 3, 2, 1].map((ratingValue) => (
                                    <button
                                        key={ratingValue}
                                        type="button"
                                        onClick={() => handleRatingChange(String(ratingValue))}
                                        className={cn(
                                            "flex items-center space-x-3 space-y-0 p-4 rounded-lg border-2 transition-all duration-300 w-full text-left",
                                            selectedRating === ratingValue 
                                                ? "bg-primary/20 border-primary" 
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
                                            ratingValue === 5 && "shadow-[0_0_15px_rgba(255,215,0,0.5)] border-amber-400"
                                        )}
                                    >
                                        <div className="flex">
                                            {Array.from({ length: ratingValue }).map((_, i) => (
                                                 <Star key={i} className={cn("h-6 w-6", ratingValue === 5 ? "text-amber-400 fill-amber-400" : "text-yellow-400 fill-yellow-400")} />
                                            ))}
                                            {Array.from({ length: 5 - ratingValue }).map((_, i) => (
                                                <Star key={i + ratingValue} className={cn("h-6 w-6 text-gray-600")} />
                                            ))}
                                        </div>
                                         <span className={cn("font-semibold", ratingValue === 5 && "text-amber-300")}>
                                            {ratingValue === 5 && "¡Excelente!"}
                                            {ratingValue === 4 && "Bueno"}
                                            {ratingValue === 3 && "Aceptable"}
                                            {ratingValue === 2 && "Regular"}
                                            {ratingValue === 1 && "Malo"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {selectedRating > 0 && selectedRating < 5 && (
                        <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in-50 duration-500 text-left">
                            <p className="text-center text-sm text-slate-300">Lamentamos que tu experiencia no haya sido perfecta. Por favor, danos más detalles.</p>
                             <FormField
                                control={form.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Tus comentarios</FormLabel>
                                        <FormControl><Textarea className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400" placeholder="Cuéntanos qué ha pasado..." {...field} /></FormControl>
                                        <FormMessage className="text-red-400"/>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Tu Nombre (Opcional)</FormLabel>
                                        <FormControl><Input className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400" placeholder="Juan Pérez" {...field} /></FormControl>
                                        <FormMessage className="text-red-400"/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Tu Email (Opcional)</FormLabel>
                                        <FormControl><Input className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400" placeholder="tu@email.com" {...field} /></FormControl>
                                         <FormMessage className="text-red-400"/>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </CardContent>
                {selectedRating > 0 && selectedRating < 5 && (
                     <CardFooter>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Comentarios
                         </Button>
                    </CardFooter>
                )}
            </form>
        </Form>
    );
}
