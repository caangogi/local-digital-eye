
"use client";

import { useState, useEffect, useRef } from 'react';
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { MoreHorizontal, ExternalLink, Link2, QrCode, Download, Share2, Trash2 } from "lucide-react";
import { Link } from "@/navigation";
import { useToast } from "@/hooks/use-toast";
import { getGoogleOAuthConsentUrl } from "@/actions/oauth.actions";
import { Loader2 } from "lucide-react";
import type { Business } from '@/backend/business/domain/business.entity';
import { cn } from '@/lib/utils';

interface BusinessActionsProps {
  business: Business;
  baseUrl: string;
}

export function BusinessActions({ business, baseUrl }: BusinessActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

  const profileLink = `${baseUrl}/negocio/${business.id}`;

  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, buttonRef]);

  const toggleMenu = () => {
    if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        // Position menu below the button, aligned to the right edge of the window.
        setMenuPosition({
            top: rect.bottom + window.scrollY,
            right: window.innerWidth - rect.right - rect.width,
        });
    }
    setIsMenuOpen(!isMenuOpen);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileLink);
    toast({
      title: "Enlace Copiado",
      description: "El enlace al perfil público se ha copiado.",
    });
    setIsMenuOpen(false);
  };
  
  const generateQRCode = async () => {
    if (!qrCodeDataUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(profileLink, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'H'
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    }
  };

  const handleOpenQrModal = () => {
    generateQRCode();
    setIsQrModalOpen(true);
    setIsMenuOpen(false);
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
      setIsConnecting(false);
    }
  };

  const menuItemClasses = "flex items-center w-full px-3 py-2 text-sm text-left text-foreground hover:bg-accent rounded-md";

  return (
    <>
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={toggleMenu} ref={buttonRef}>
        <span className="sr-only">Abrir menú</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{ top: `${menuPosition.top + 8}px`, right: `${menuPosition.right}px`}}
          className="fixed z-50 w-56 origin-top-right rounded-md bg-popover p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Acciones del Perfil</p>
            <Link href={profileLink} target="_blank" className={menuItemClasses} role="menuitem" onClick={() => setIsMenuOpen(false)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Ir al perfil del negocio</span>
            </Link>
            <button onClick={copyToClipboard} className={menuItemClasses} role="menuitem">
              <Link2 className="mr-2 h-4 w-4" />
              <span>Copiar enlace del perfil</span>
            </button>
            <button onClick={handleOpenQrModal} className={menuItemClasses} role="menuitem">
              <QrCode className="mr-2 h-4 w-4" />
              <span>Generar QR</span>
            </button>
            <div className="my-1 h-px bg-border" />
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Integraciones</p>
            <button onClick={handleConnectGoogle} className={menuItemClasses} disabled={isConnecting} role="menuitem">
               {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
              <span>Conectar Perfil de Google</span>
            </button>
             <button className={cn(menuItemClasses, "text-destructive hover:bg-destructive hover:text-destructive-foreground")} role="menuitem">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Desconectar</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Código QR para Perfil de Negocio</DialogTitle>
            <DialogDescription>
              Tus clientes pueden escanear este código para ir directamente a la página de perfil público de &quot;{business.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-white rounded-md my-4">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt={`Código QR para ${business.name}`} />
            ) : (
              <div className="h-[256px] w-[256px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDownloadQr} className="w-full" disabled={!qrCodeDataUrl}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    