import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, ArrowUpDown, Filter } from "lucide-react";
import { Link } from "@/navigation"; // Use next-intl's Link
import {getTranslator} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslator(locale, 'AppSidebar'); 
  return {
    title: t('businesses')
  };
}

// Mock data for businesses
const businesses = [
  { id: "1", name: "The Cozy Cafe", status: "Analyzed", score: 85, dateAdded: "2023-10-15", tags: ["Restaurant", "Local Favorite"] },
  { id: "2", name: "Sunnydale Bakery", status: "Pending Analysis", score: null, dateAdded: "2023-10-20", tags: ["Bakery", "New"] },
  { id: "3", name: "Tech Solutions Inc.", status: "Analyzed", score: 72, dateAdded: "2023-09-01", tags: ["Tech", "B2B"] },
  { id: "4", name: "Green Thumb Nursery", status: "Error", score: null, dateAdded: "2023-10-22", tags: ["Gardening", "Seasonal"] },
  { id: "5", name: "Vintage Threads Boutique", status: "Re-analyzing", score: 78, dateAdded: "2023-08-15", tags: ["Retail", "Fashion"] },
];

function getStatusBadgeVariant(status: string | null) {
  switch (status) {
    case "Analyzed": return "default";
    case "Pending Analysis": return "secondary";
    case "Error": return "destructive";
    case "Re-analyzing": return "outline"; 
    default: return "secondary";
  }
}

export default function BusinessesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Analyzed Businesses</h1>
          <p className="text-muted-foreground">Manage and review your analyzed businesses.</p>
        </div>
        <Link href="/businesses/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Business
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search businesses..." className="pl-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline">
            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Overall Score</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{business.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(business.status)}>{business.status}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {business.score !== null ? `${business.score}/100` : "N/A"}
                </TableCell>
                <TableCell>{business.dateAdded}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {business.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
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
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Generate Report</DropdownMenuItem>
                      <DropdownMenuItem>Re-analyze</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
