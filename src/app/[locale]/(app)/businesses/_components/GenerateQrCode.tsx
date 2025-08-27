
"use client";

import QRCode from "qrcode";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface GenerateQrCodeProps {
  profileLink: string;
  businessName: string;
}

export function GenerateQrCode({ profileLink, businessName }: GenerateQrCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const generateQRCode = async () => {
    if (qrCodeDataUrl) return; // Generate only once
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
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `qr-perfil-${businessName.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            generateQRCode();
          }}
        >
          <QrCode className="mr-2 h-4 w-4" />
          <span>Generar QR del Perfil</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Código QR para Perfil de Negocio</DialogTitle>
          <DialogDescription>
            Tus clientes pueden escanear este código para ir directamente a la página de perfil público de &quot;{businessName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 bg-white rounded-md my-4">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt={`Código QR para ${businessName}`} />
          ) : (
            <div className="h-[256px] w-[256px] flex items-center justify-center">
              <p>Generando código QR...</p>
            </div>
          )}
        </div>
        <DialogFooter>
           <Button onClick={handleDownload} className="w-full" disabled={!qrCodeDataUrl}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
