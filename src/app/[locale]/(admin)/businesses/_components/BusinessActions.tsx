
"use client";

import { useState } from 'react';
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
import { MoreHorizontal, ExternalLink, Link2, QrCode, Download, Trash2, Loader2, Link as LinkIcon, UserPlus, Copy, AlertTriangle } from "lucide-react";
import { Link } from "@/navigation";
import { useToast } from "@/hooks/use-toast";
import { getGoogleOAuthConsentUrl } from "@/actions/oauth.actions";
import { generateOnboardingLink } from "@/actions/onboarding.actions.ts";
import type { Business } from '@/backend/business/domain/business.entity';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BusinessActionsProps {
  business: Business;
  baseUrl: string;
}

export function BusinessActions({ business, baseUrl }: BusinessActionsProps) {
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [onboardingLink, setOnboardingLink] = useState("");
  
  const { toast } = useToast();

  const profileLink = `${baseUrl}/negocio/${business.id}`;

  const copyToClipboard = (textToCopy: string, successMessage: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "¡Copiado!",
      description: successMessage,
    });
    // Close modals on copy
    setIsActionsModalOpen(false);
    setIsOnboardingModalOpen(false);
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
    try {
      const url = await getGoogleOAuthConsentUrl(business.id);
      window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Error de Conexión",
        description: "No se pudo iniciar la conexión con Google. " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateOnboardingLink = async () => {
    setIsGeneratingLink(true);
    try {
        const link = await generateOnboardingLink({ businessId: business.id, planType: 'freemium' });
        setOnboardingLink(link);
        setIsActionsModalOpen(false);
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
  
  const handleDisconnectBusiness = () => {
    // Here you would call the server action to disconnect the business
    console.log(`Disconnecting business ${business.id}`);
    toast({
        title: "Negocio Desconectado",
        description: `"${business.name}" ha sido eliminado de tu lista.`,
        variant: "destructive"
    });
  }

  const actionButtonClasses = "w-full justify-start p-3 h-auto";

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
             <Button variant="outline" className={cn(actionButtonClasses, "text-base p-4")} onClick={handleConnectGoogle} disabled={isConnecting}>
                 {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                 Verificar Google
            </Button>
            
            <Separator className="my-2" />

            {/* Main Action */}
             <Button variant="default" className={cn(actionButtonClasses, "text-base p-4")} onClick={handleGenerateOnboardingLink} disabled={isGeneratingLink}>
                 {isGeneratingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                 Invitar al Dueño
            </Button>
            
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enlace de Invitación para el Dueño</DialogTitle>
            <DialogDescription>Copia y envía este enlace al dueño del negocio para que pueda crear su cuenta y conectar sus servicios.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="onboarding-link">Enlace de Invitación Único</Label>
            <div className="flex items-center space-x-2">
              <Input id="onboarding-link" value={onboardingLink} readOnly className="text-xs"/>
              <Button type="button" size="sm" onClick={() => copyToClipboard(onboardingLink, "¡Enlace de invitación copiado!")}>
                  <span className="sr-only">Copiar</span>
                  <Copy className="h-4 w-4" />
              </Button>
            </div>
             <p className="text-xs text-muted-foreground pt-2">Este enlace es válido durante 7 días y solo puede ser usado una vez.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsOnboardingModalOpen(false); setIsActionsModalOpen(true); }}>Volver</Button>
            <DialogClose asChild><Button type="button" variant="secondary">Cerrar</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
