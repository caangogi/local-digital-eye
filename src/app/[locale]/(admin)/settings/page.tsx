
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, ListChecks, Palette, UserCircle, ShieldCheck, Bug, Users, Crown } from "lucide-react";
import Image from "next/image";
import {getTranslations} from 'next-intl/server';
import { PasswordAuthForm } from "./_components/PasswordAuthForm";
import { AuthDebugInfo } from "./_components/AuthDebugInfo";
import { AdminTools } from "./_components/AdminTools";
import { Link } from "@/navigation";


export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: t('settings')
  };
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and application settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Demo User" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="demo@example.com" readOnly />
            </div>
            <Button className="w-full sm:w-auto">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Notifications</CardTitle>
            <CardDescription>Configure your alert preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rating-drop-alerts" className="flex-grow">Rating Drop Alerts</Label>
              <Switch id="rating-drop-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="competitor-campaign-alerts" className="flex-grow">Competitor Campaign Alerts</Label>
              <Switch id="competitor-campaign-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reanalysis-reminders" className="flex-grow">Re-analysis Reminders</Label>
              <Switch id="reanalysis-reminders" defaultChecked/>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>Security</CardTitle>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PasswordAuthForm />
          </CardContent>
        </Card>
        
        {/* Admin Tools Section */}
        <Card className="lg:col-span-3 shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Crown className="mr-2 h-5 w-5 text-primary"/>Admin Tools</CardTitle>
            <CardDescription>Manage users and system settings. (Only visible to Super Admins)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <AdminTools/>
          </CardContent>
        </Card>
        
         <Card className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Bug className="mr-2 h-5 w-5 text-primary"/>Debug Information</CardTitle>
            <CardDescription>Raw authentication and user data for debugging purposes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <AuthDebugInfo />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
