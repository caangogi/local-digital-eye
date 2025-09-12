
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import QRCode from "qrcode";
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, Link2, QrCode, Download, Trash2, Loader2, Link as LinkIcon, UserPlus, Copy, AlertTriangle, CalendarPlus, Gift, Star, Crown, Send, MessageSquare, DollarSign, Ban } from "lucide-react";
import { Link } from "@/navigation";
import { useToast } from "@/hooks/use-toast";
import { getGoogleOAuthConsentUrl } from "@/actions/oauth.actions";
import { generateOnboardingLink, sendOnboardingEmail } from "@/actions/onboarding.actions.ts";
import type { Business, SubscriptionPlan } from '@/backend/business/domain/business.entity';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExtendTrialDialog } from './dialogs/ExtendTrialDialog';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface BusinessActionsProps {
  business: Business;
  baseUrl: string;
}

const setupFeeSchema = z.object({
  includeFee: z.boolean().default(true),
  feeAmount: z.coerce.number().optional(),
}).refine(data => {
  if (data.includeFee) {
    return data.feeAmount && data.feeAmount > 0;
  }
  return true;
}, {
  message: "El importe debe ser mayor que 0.",
  path: ["feeAmount"],
});

type SetupFeeFormValues = z.infer<typeof setupFeeSchema>;

export function BusinessActions({ business, baseUrl }: BusinessActionsProps) {
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isExtendTrialModalOpen, setIsExtendTrialModalOpen] = useState(false);
  const [isSetupFeeModalOpen, setIsSetupFeeModalOpen] = useState(false);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const [onboardingLink, setOnboardingLink] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const { toast } = useToast();
  
  const form = useForm<SetupFeeFormValues>({
    resolver: zodResolver(setupFeeSchema),
    defaultValues: {
      includeFee: true,
      feeAmount: 279,
    },
  });
  const includeFee = form.watch("includeFee");

  const profileLink = `${baseUrl}/negocio/${business.id}`;

  const copyToClipboard = (textToCopy: string, successMessage: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "¡Copiado!",
      description: successMessage,
    });
  };
  
  const generateQRCode = async () => {
    if (qrCodeDataUrl) return;
    try {
      const dataUrl = await QRCode.toDataURL(profileLink, { width: 400, margin: 2, errorCorrectionLevel: 'H' });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  const handleOpenQrModal = () => {
    generateQRCode();
    setIsActionsModalOpen(false);
    setIsQrModalOpen(true);
  }

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `qr-perfil-${business.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    // For manual re-connection, we assume the freemium path as it's the simplest.
    try {
      const url = await getGoogleOAuthConsentUrl(business.id, 'freemium');
      window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Error de Conexión",
        description: "No se pudo iniciar la conexión con Google. " + error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleGenerateOnboardingLink = async (planType: SubscriptionPlan, setupFee?: number) => {
    setIsGeneratingLink(true);
    try {
        const link = await generateOnboardingLink({ 
            businessId: business.id, 
            planType,
            setupFee: setupFee ? setupFee * 100 : undefined // Convert to cents
        });
        setOnboardingLink(link);
        setSelectedPlan(planType);
        setIsActionsModalOpen(false);
        setIsSetupFeeModalOpen(false);
        setIsOnboardingModalOpen(true);
    } catch (error: any) {
        toast({
            title: "Error al generar enlace",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsGeneratingLink(false);
    }
  };

  const handleOpenSetupFeeModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsSetupFeeModalOpen(true);
  };
  
  const handleSetupFeeSubmit = (data: SetupFeeFormValues) => {
    if (!selectedPlan || selectedPlan === 'freemium') return;
    handleGenerateOnboardingLink(selectedPlan, data.includeFee ? data.feeAmount : undefined);
  };
  
  const handleDisconnectBusiness = () => {
    console.log(`Disconnecting business ${business.id}`);
    toast({
        title: "Negocio Desconectado",
        description: `"${business.name}" ha sido eliminado de tu lista.`,
        variant: "destructive"
    });
  }

  const getPlanName = (planType: SubscriptionPlan | null) => {
    switch (planType) {
      case 'freemium': return 'Prueba Gratuita';
      case 'professional': return 'Plan Profesional';
      case 'premium': return 'Plan Premium';
      default: return 'Desconocido';
    }
  };

  const generateInvitationMessage = (link: string, planName: string) => {
    return `¡Hola! 🚀\n\nTe invito a tomar el control de la presencia online de "${business.name}" con nuestra plataforma.\n\nHe preparado tu acceso para el ${planName}. Solo tienes que registrarte a través de este enlace seguro para empezar a gestionar tu perfil, ver tus métricas y mucho más.\n\n👉 ${link}\n\n¡Espero verte dentro!\n\nUn saludo,`;
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !selectedPlan || !onboardingLink) return;
    setIsSendingEmail(true);
    try {
      const response = await sendOnboardingEmail({
        recipientEmail,
        onboardingLink,
        businessName: business.name,
        planName: getPlanName(selectedPlan),
      });

      if (response.success) {
        toast({
          title: "¡Email Enviado!",
          description: `La invitación ha sido enviada a ${recipientEmail}.`,
        });
        setIsOnboardingModalOpen(false);
        setRecipientEmail("");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Error al Enviar Email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  }

  const invitationMessage = generateInvitationMessage(onboardingLink, getPlanName(selectedPlan));

  const actionButtonClasses = "w-full justify-start p-3 h-auto";
  const gmbLinked = business.gmbStatus === 'linked';

  return (
    <>
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setIsActionsModalOpen(true); }}>
        <span className="sr-only">Abrir menú de acciones</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <Dialog open={isActionsModalOpen} onOpenChange={setIsActionsModalOpen}>
        <DialogContent className="sm:max-w-xs p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Acciones para {business.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-1 p-2">
            {/* Standard Actions */}
            <Button asChild variant="outline" className={cn(actionButtonClasses, "text-base p-4")}>
                <Link href={profileLink} target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Ir al perfil público</Link>
            </Button>
            <Button variant="outline" className={cn(actionButtonClasses, "text-base p-4")} onClick={() => copyToClipboard(profileLink, "El enlace al perfil público se ha copiado.")}>
              <Link2 className="mr-2 h-4 w-4" /> Copiar enlace público
            </Button>
             <Button variant="outline" className={cn(actionButtonClasses, "text-base p-4")} onClick={handleOpenQrModal}>
                <QrCode className="mr-2 h-4 w-4" /> Generar QR de reseñas
            </Button>
            
            {/* Conditional Google Action */}
            {!gmbLinked && (
                 <Button variant="outline" className={cn(actionButtonClasses, "text-base p-4")} onClick={handleConnectGoogle} disabled={isConnecting}>
                     {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                     Verificar Google
                </Button>
            )}
            
            <Separator className="my-2" />

            {/* Main Actions based on owner status */}
            {!business.ownerId ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="default" className={cn(actionButtonClasses, "text-base p-4")}>
                           <UserPlus className="mr-2 h-4 w-4" /> Invitar al Dueño
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Seleccionar Plan de Invitación</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleGenerateOnboardingLink('freemium')} disabled={isGeneratingLink}>
                            {isGeneratingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Gift className="mr-2 h-4 w-4" />}
                            Prueba Gratuita
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenSetupFeeModal('professional')} disabled={isGeneratingLink}>
                             <Star className="mr-2 h-4 w-4" />
                            Plan Profesional
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleOpenSetupFeeModal('premium')} disabled={isGeneratingLink}>
                             <Crown className="mr-2 h-4 w-4" />
                            Plan Premium
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            ) : (
                <Button variant="outline" className={cn(actionButtonClasses, "text-base p-4")} onClick={() => setIsExtendTrialModalOpen(true)}>
                    <CalendarPlus className="mr-2 h-4 w-4" /> Extender Prueba
                </Button>
            )}
            
            <Separator className="my-2" />

            {/* Destructive Action */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="outline" 
                        className={cn(
                            actionButtonClasses, 
                            "text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground",
                            "text-base p-4"
                        )}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Desconectar negocio
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive h-6 w-6"/>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es irreversible. Se eliminará el negocio <strong className="font-semibold text-foreground">{business.name}</strong> de tu pipeline y todos los datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnectBusiness} className="bg-destructive hover:bg-destructive/90">
                           Sí, desconectar negocio
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR para {business.name}</DialogTitle>
            <DialogDescription>Los clientes pueden escanear este código para visitar el perfil público y dejar una reseña.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-white rounded-md my-4">
            {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt={`Código QR para ${business.name}`} className="w-64 h-64" /> : <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          </div>
          <DialogFooter className="sm:justify-between gap-2">
             <Button onClick={() => { setIsQrModalOpen(false); setIsActionsModalOpen(true); }} variant="outline">Volver</Button>
             <Button onClick={handleDownloadQr} disabled={!qrCodeDataUrl}><Download className="mr-2 h-4 w-4" /> Descargar PNG</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOnboardingModalOpen} onOpenChange={setIsOnboardingModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invitación para <span className="text-primary">{getPlanName(selectedPlan)}</span></DialogTitle>
            <DialogDescription>Copia el mensaje, envíalo por WhatsApp o manda un email directamente desde aquí.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Label htmlFor="invitation-message">Mensaje de Invitación</Label>
            <Textarea id="invitation-message" value={invitationMessage} readOnly rows={8} className="text-xs bg-muted/50" />
             <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1" onClick={() => copyToClipboard(invitationMessage, "¡Mensaje de invitación copiado!")}><Copy className="mr-2"/> Copiar Mensaje</Button>
                <a href={`https://wa.me/?text=${encodeURIComponent(invitationMessage)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full bg-green-500 hover:bg-green-600 text-white"><MessageSquare className="mr-2"/> WhatsApp</Button>
                </a>
             </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Label htmlFor="recipient-email">O enviar por email directamente</Label>
             <div className="flex flex-col sm:flex-row gap-2">
                <Input id="recipient-email" type="email" placeholder="email.del.dueño@negocio.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                <Button onClick={handleSendEmail} disabled={isSendingEmail || !recipientEmail} className="w-full sm:w-auto">
                    {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                    Enviar Email
                </Button>
             </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOnboardingModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSetupFeeModalOpen} onOpenChange={setIsSetupFeeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={form.handleSubmit(handleSetupFeeSubmit)}>
              <DialogHeader>
                  <DialogTitle>Configurar Invitación de Pago</DialogTitle>
                  <DialogDescription>
                    Define si quieres incluir una cuota de alta para el <strong className="text-foreground">{getPlanName(selectedPlan)}</strong>.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <div className="flex items-center space-x-2">
                      <Switch 
                          id="include-fee" 
                          checked={includeFee} 
                          onCheckedChange={(checked) => form.setValue("includeFee", checked)}
                      />
                      <Label htmlFor="include-fee">Incluir Cuota de Alta</Label>
                  </div>
                  {includeFee && (
                      <div className="grid gap-2">
                          <Label htmlFor="fee-amount">Importe de la Cuota de Alta (€)</Label>
                           <div className="relative">
                               <Input 
                                  id="fee-amount" 
                                  type="number"
                                  step="0.01"
                                  {...form.register("feeAmount")}
                               />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">€</div>
                           </div>
                           {form.formState.errors.feeAmount && (
                              <p className="text-sm text-destructive">{form.formState.errors.feeAmount.message}</p>
                           )}
                      </div>
                  )}
              </div>
              <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsSetupFeeModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isGeneratingLink}>
                    {isGeneratingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Generar Enlace de Invitación
                  </Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExtendTrialDialog 
        businessId={business.id}
        businessName={business.name}
        isOpen={isExtendTrialModalOpen}
        onOpenChange={setIsExtendTrialModalOpen}
      />
    </>
  );
}

    