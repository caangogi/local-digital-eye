

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, ArrowUpDown, Filter, Loader2 } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from 'next-intl';
import { listUserBusinesses } from "@/actions/business.actions";
import { ToastHandler } from "./_components/ToastHandler";
import { BusinessActions } from "./_components/BusinessActions";
import type { Business } from '@/backend/business/domain/business.entity';


export default function BusinessesPage() {
  const t = useTranslations('BusinessesPage');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // This should come from an environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

  useEffect(() => {
    async function loadBusinesses() {
      setIsLoading(true);
      try {
        const userBusinesses = await listUserBusinesses();
        setBusinesses(userBusinesses);
        setFilteredBusinesses(userBusinesses);
      } catch (error) {
        console.error("Failed to load businesses:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  useEffect(() => {
    const results = businesses.filter(business =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(results);
  }, [searchTerm, businesses]);

  const salesStatusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "outline" | "destructive" } } = {
    'new': { label: 'Nuevo', variant: 'default' },
    'contacted': { label: 'Contactado', variant: 'secondary' },
    'follow_up': { label: 'Seguimiento', variant: 'outline' },
    'closed_won': { label: 'Ganado', variant: 'default' },
    'closed_lost': { label: 'Perdido', variant: 'destructive' },
  }


  return (
    <div className="flex flex-col gap-6">
      <ToastHandler />
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
          <Input 
            placeholder={t('searchPlaceholder')} 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              <TableHead>Estado GMB</TableHead>
              <TableHead>Estado de Venta</TableHead>
              <TableHead>{t('table.tags')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredBusinesses.length > 0 ? filteredBusinesses.map((business) => (
              <TableRow key={business.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{business.name}</TableCell>
                <TableCell>
                    <Badge variant={business.gmbStatus === 'linked' ? 'default' : 'outline'}>
                        {business.gmbStatus === 'linked' ? 'Verificado' : 'No Verificado'}
                    </Badge>
                </TableCell>
                 <TableCell>
                  <Badge variant={salesStatusMap[business.salesStatus || 'new']?.variant || 'secondary'} className="capitalize">
                      {salesStatusMap[business.salesStatus || 'new']?.label || business.salesStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {business.customTags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <BusinessActions business={business} baseUrl={baseUrl} />
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No hay negocios que coincidan con tu búsqueda.{" "}
                        {businesses.length > 0 && (
                           <Button variant="link" className="p-0" onClick={() => setSearchTerm('')}>Limpiar búsqueda</Button>
                        )}
                        {businesses.length === 0 && (
                            <Link href="/businesses/add" className="text-primary hover:underline">
                                ¡Añade uno para empezar!
                            </Link>
                        )}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
