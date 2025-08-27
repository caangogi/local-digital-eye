import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, ArrowUpDown, Filter, Link as LinkIcon, Share2 } from "lucide-react";
import { Link } from "@/navigation";
import { getTranslations } from 'next-intl/server';
import { listUserBusinesses } from "@/actions/business.actions";
import { CopyReviewLink } from "./_components/CopyReviewLink";
import { GenerateQrCode } from "./_components/GenerateQrCode";
import { ConnectGoogleProfile } from "./_components/ConnectGoogleProfile";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('BusinessesPage'); 
  return {
    title: t('title')
  };
}

export default async function BusinessesPage() {
  const t = await getTranslations('BusinessesPage');
  const businesses = await listUserBusinesses();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/businesses/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('addButton')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchPlaceholder')} className="pl-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> {t('filterButton')}
          </Button>
          <Button variant="outline">
            <ArrowUpDown className="mr-2 h-4 w-4" /> {t('sortButton')}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.length > 0 ? businesses.map((business) => (
              <TableRow key={business.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{business.name}</TableCell>
                <TableCell>
                    <div className="flex flex-col gap-1">
                        <Badge variant="secondary">Enlace Generado</Badge>
                        <Badge variant={business.gmbStatus === 'linked' ? 'default' : 'outline'}>
                            {business.gmbStatus === 'linked' ? 'GMB Verificado' : 'GMB no verificado'}
                        </Badge>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Activos de Reseña</DropdownMenuLabel>
                       <CopyReviewLink reviewLink={business.reviewLink} />
                       <GenerateQrCode reviewLink={business.reviewLink} businessName={business.name} />
                      <DropdownMenuSeparator />
                      <ConnectGoogleProfile businessId={business.id} />
                      <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Desconectar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        No hay negocios conectados.{" "}
                        <Link href="/businesses/add" className="text-primary hover:underline">
                            ¡Añade uno para empezar!
                        </Link>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
