
"use client";

import { useState } from 'react';
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { MoreHorizontal, ExternalLink, Link2, QrCode, Download, Share2, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import { Link } from "@/navigation";
import { useToast } from "@/hooks/use-toast";
import { getGoogleOAuthConsentUrl } from "@/actions/oauth.actions";
import type { Business } from '@/backend/business/domain/business.entity';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface BusinessActionsProps {
  business: Business;
  baseUrl: string;
}

export function BusinessActions({ business, baseUrl }: BusinessActionsProps) {
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { toast } = useToast();

  const profileLink = `${baseUrl}/negocio/${business.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileLink);
    toast({
      title: "Enlace Copiado",
      description: "El enlace al perfil público se ha copiado.",
    });
    setIsActionsModalOpen(false);
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
    setIsActionsModalOpen(false); // Close first modal
    setIsQrModalOpen(true);      // Open QR modal
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
    } finally {
        // No need to set isConnecting to false, as the page will redirect
    }
  };
  
  const actionButtonClasses = "w-full justify-start p-4 text-sm sm:p-5 sm:text-base";

  return (
    <>
      {/* Trigger Button */}
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsActionsModalOpen(true)}>
        <span className="sr-only">Abrir menú de acciones</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {/* Main Actions Dialog */}
      <Dialog open={isActionsModalOpen} onOpenChange={setIsActionsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acciones para &quot;{business.name}&quot;</DialogTitle>
            <DialogDescription>
              Selecciona una acción para gestionar el perfil de este negocio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className={actionButtonClasses}>
                      <Link href={profileLink} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" /> Ir al perfil público
                      </Link>
                  </Button>
                  <Button variant="outline" className={actionButtonClasses} onClick={copyToClipboard}>
                    <Link2 className="mr-2 h-4 w-4" /> Copiar enlace
                  </Button>
                   <Button variant="outline" className={actionButtonClasses} onClick={handleOpenQrModal}>
                      <QrCode className="mr-2 h-4 w-4" /> Generar QR
                  </Button>
                   <Button variant="outline" className={actionButtonClasses} onClick={handleConnectGoogle} disabled={isConnecting}>
                       {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                       Conectar Google
                  </Button>
              </div>
              <Separator />
               <Button variant="destructive" className={cn(actionButtonClasses, "w-full")}>
                  <Trash2 className="mr-2 h-4 w-4" /> Desconectar negocio
              </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR para {business.name}</DialogTitle>
            <DialogDescription>
              Los clientes pueden escanear este código para visitar el perfil público y dejar una reseña.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-white rounded-md my-4">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt={`Código QR para ${business.name}`} className="w-64 h-64" />
            ) : (
              <div className="h-64 w-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between gap-2">
             <Button onClick={() => { setIsQrModalOpen(false); setIsActionsModalOpen(true); }} variant="outline">
                Volver
            </Button>
            <Button onClick={handleDownloadQr} disabled={!qrCodeDataUrl}>
              <Download className="mr-2 h-4 w-4" /> Descargar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
