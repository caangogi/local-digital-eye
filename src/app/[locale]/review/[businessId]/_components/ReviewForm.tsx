
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
    phone: z.string().optional(),
}).refine(data => {
    // If rating is < 5, comment, name and email must be provided.
    const ratingNum = parseInt(data.rating, 10);
    if (ratingNum < 5) {
        return data.comment && data.comment.length > 10 && data.name && data.name.length > 1 && data.email;
    }
    return true;
}, {
    message: "Por favor, déjanos un comentario de al menos 10 caracteres y completa tu nombre y email.",
    path: ["comment"], 
});

type ReviewFormValues = z.infer<typeof reviewSchema>;


const reviewPrompts = [
    { title: "Valora tu experiencia ✨", description: "¡Tu opinión es muy importante para nosotros! Ayúdanos a mejorar con tu reseña." },
    { title: "¿Qué tal fue todo? 🤔", description: "Nos encantaría saber cómo fue tu visita. ¡Gracias por dedicarnos un momento!" },
    { title: "¡Tu voz nos importa! 📣", description: "Comparte tu experiencia para que podamos seguir creciendo y ofreciéndote lo mejor." },
    { title: "Una ayudita por aquí, por favor 🙏", description: "Tus comentarios son el motor de nuestro día a día. ¡Cuéntanos qué te pareció!" },
    { title: "Califica nuestro servicio 🌟", description: "Tómate un segundo para valorar tu experiencia. ¡Cada detalle cuenta para nosotros!" },
];

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
    const [prompt, setPrompt] = useState({ title: "Valora tu experiencia", description: "Queremos conocer tu opinión para seguir mejorando. ¡Gracias por tu tiempo!" });
    const [thankYouMessage, setThankYouMessage] = useState('');

    useEffect(() => {
        setPrompt(reviewPrompts[Math.floor(Math.random() * reviewPrompts.length)]);
        setThankYouMessage(thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)]);
    }, []);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: "0", comment: "", name: "", email: "", phone: "" }
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
                userPhone: data.phone,
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
                <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400"/>
                <h3 className="text-xl font-bold">¡Gracias por tu feedback!</h3>
                <p className="text-muted-foreground whitespace-pre-line">{thankYouMessage}</p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardHeader>
                    <CardTitle className="text-2xl">{prompt.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{prompt.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="sr-only">¿Con cuántas estrellas nos valoras?</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                                {[5, 4, 3, 2, 1].map((ratingValue) => (
                                    <button
                                        key={ratingValue}
                                        type="button"
                                        onClick={() => handleRatingChange(String(ratingValue))}
                                        className={cn(
                                            "flex items-center space-x-3 space-y-0 p-4 rounded-lg border-2 transition-all duration-300 w-full text-left",
                                            selectedRating === ratingValue 
                                                ? "bg-primary/10 dark:bg-primary/20 border-primary" 
                                                : "bg-muted/50 dark:bg-white/5 border-border dark:border-white/10 hover:bg-muted dark:hover:bg-white/10 hover:border-muted-foreground/20 dark:hover:border-white/20",
                                            ratingValue === 5 && "shadow-[0_0_15px_rgba(255,215,0,0.5)] border-amber-400"
                                        )}
                                    >
                                        <div className="flex">
                                            {Array.from({ length: ratingValue }).map((_, i) => (
                                                 <Star key={i} className={cn("h-6 w-6", ratingValue === 5 ? "text-amber-400 fill-amber-400" : "text-yellow-400 fill-yellow-400")} />
                                            ))}
                                            {Array.from({ length: 5 - ratingValue }).map((_, i) => (
                                                <Star key={i + ratingValue} className={cn("h-6 w-6 text-gray-300 dark:text-gray-600")} />
                                            ))}
                                        </div>
                                         <span className={cn("font-semibold", ratingValue === 5 && "text-amber-400 dark:text-amber-300")}>
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
                          <FormMessage className="text-red-500 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    {selectedRating > 0 && selectedRating < 5 && (
                        <div className="space-y-4 pt-4 border-t border-border animate-in fade-in-50 duration-500 text-left">
                            <p className="text-center text-sm text-muted-foreground">Lamentamos que tu experiencia no haya sido perfecta. Por favor, danos más detalles.</p>
                             <FormField
                                control={form.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tus comentarios <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Textarea className="bg-background/50 dark:bg-slate-800/50 border-border dark:border-slate-700 placeholder:text-muted-foreground" placeholder="Cuéntanos qué ha pasado..." {...field} /></FormControl>
                                        <FormMessage className="text-red-500 dark:text-red-400"/>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tu Nombre <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input className="bg-background/50 dark:bg-slate-800/50 border-border dark:border-slate-700 placeholder:text-muted-foreground" placeholder="Juan Pérez" {...field} /></FormControl>
                                        <FormMessage className="text-red-500 dark:text-red-400"/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tu Email <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input className="bg-background/50 dark:bg-slate-800/50 border-border dark:border-slate-700 placeholder:text-muted-foreground" placeholder="tu@email.com" {...field} /></FormControl>
                                         <FormMessage className="text-red-500 dark:text-red-400"/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tu Teléfono (Opcional)</FormLabel>
                                        <FormControl><Input className="bg-background/50 dark:bg-slate-800/50 border-border dark:border-slate-700 placeholder:text-muted-foreground" placeholder="+34 600 000 000" {...field} /></FormControl>
                                         <FormMessage className="text-red-500 dark:text-red-400"/>
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
