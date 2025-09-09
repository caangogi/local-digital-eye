
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Shield, Crown, User, MoreHorizontal, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setUserRole } from '@/actions/user.actions';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/backend/user/domain/user.entity';

// Define a serializable user type that can be passed from Server to Client Components
export interface SerializableUser {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    customClaims?: { [key: string]: any };
    metadata: {
        creationTime: string;
    };
}

interface UserListProps {
    initialUsers: SerializableUser[];
}

export function UserList({ initialUsers }: UserListProps) {
    const [users, setUsers] = useState(initialUsers);
    const [isLoading, setIsLoading] = useState<string | null>(null); // Store UID of user being updated
    const { toast } = useToast();

    const handleSetRole = async (uid: string, role: UserRole) => {
        setIsLoading(uid);
        const response = await setUserRole(uid, role);

        if (response.success) {
            toast({
                title: 'Role Updated',
                description: response.message,
            });
            // Optimistically update the UI
            setUsers(prevUsers => prevUsers.map(u => 
                u.uid === uid 
                ? { ...u, customClaims: { ...u.customClaims, role } } 
                : u
            ));
        } else {
            toast({
                title: 'Error',
                description: response.message,
                variant: 'destructive',
            });
        }
        setIsLoading(null);
    };

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'super_admin':
                return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600"><Crown className="mr-1 h-3 w-3"/>Super Admin</Badge>;
            case 'admin':
                return <Badge variant="secondary"><Shield className="mr-1 h-3 w-3"/>Admin</Badge>;
            case 'owner':
                return <Badge variant="outline"><User className="mr-1 h-3 w-3"/>Owner</Badge>;
            default:
                return <Badge variant="outline">No Role</Badge>;
        }
    };
    
    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase();
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email Verified</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.uid}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.displayName || 'No Name'}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.customClaims?.role)}</TableCell>
                            <TableCell>
                                <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                                    {user.emailVerified ? 'Yes' : 'No'}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(user.metadata.creationTime), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={!!isLoading}>
                                            {isLoading === user.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleSetRole(user.uid, 'admin')} disabled={user.customClaims?.role === 'admin'}>
                                            <Shield className="mr-2 h-4 w-4"/> Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSetRole(user.uid, 'owner')} disabled={user.customClaims?.role === 'owner'}>
                                            <User className="mr-2 h-4 w-4"/> Make Owner
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSetRole(user.uid, 'super_admin')} disabled={user.customClaims?.role === 'super_admin'}>
                                            <Crown className="mr-2 h-4 w-4"/> Make Super Admin
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
