import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart2, Users, MapPin, Search, Zap, ArrowRight, Globe } from "lucide-react";
import { Link } from "@/navigation"; // Use next-intl's Link
import Image from "next/image";
import {useTranslations, useLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('LandingPage');
  return {
    title: t('title')
  };
}

export default function LandingPage() {
  const t = useTranslations('LandingPage');
  const tFeatures = useTranslations('Features');
  const currentLocale = useLocale();

  const features = [
    {
      icon: <Search size={20} className="text-accent" />,
      title: tFeatures('businessDiscovery.title'),
      description: tFeatures('businessDiscovery.description'),
    },
    {
      icon: <BarChart2 size={20} className="text-accent" />,
      title: tFeatures('insightfulDashboards.title'),
      description: tFeatures('insightfulDashboards.description'),
    },
    {
      icon: <Zap size={20} className="text-accent" />,
      title: tFeatures('aiRecommendations.title'),
      description: tFeatures('aiRecommendations.description'),
    },
    {
      icon: <Users size={20} className="text-accent" />,
      title: tFeatures('competitiveAnalysis.title'),
      description: tFeatures('competitiveAnalysis.description'),
    },
    {
      icon: <MapPin size={20} className="text-accent" />,
      title: tFeatures('geographicTargeting.title'),
      description: tFeatures('geographicTargeting.description'),
    },
    {
      icon: <CheckCircle size={20} className="text-accent" />,
      title: tFeatures('actionableReports.title'),
      description: tFeatures('actionableReports.description'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[80vw] h-[80vh] md:w-[70vw] md:h-[80vh] opacity-60"
             style={{
               background: 'radial-gradient(ellipse at bottom right, hsl(var(--accent) / 0.5) 0%, hsl(var(--background)) 70%)',
               filter: 'blur(30px)'
             }}>
        </div>
         <div className="absolute top-0 left-0 w-[50vw] h-[50vh] md:w-[40vw] md:h-[50vh] opacity-30"
             style={{
               background: 'radial-gradient(ellipse at top left, hsl(var(--primary) / 0.3) 0%, hsl(var(--background)) 70%)',
               filter: 'blur(40px)'
             }}>
        </div>
      </div>

      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground group-hover:text-accent transition-colors">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
          <h1 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">{t('title')}</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_5px_hsl(var(--accent)/0.3)]">
              {t('login')}
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-6 py-16 md:py-24">
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              dangerouslySetInnerHTML={{ __html: t.markup('heroTitle', { accent: (chunks) => `<span class="text-accent">${chunks}</span>` }) }}
            />
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10">
              {t('heroSubtitle')}
            </p>
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-foreground text-background hover:bg-gray-300 rounded-lg text-base font-semibold px-8 py-3 shadow-lg hover:shadow-[0_0_25px_10px_hsl(var(--accent)/0.4)] transition-all duration-300"
              >
                {t('openDashboardButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="hidden md:flex justify-center items-center relative">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.2)]">
                    <CardHeader className="p-2">
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-2 ring-1 ring-accent/30">
                            <Image src="https://picsum.photos/40/40" alt="User Avatar" width={40} height={40} className="rounded-full" data-ai-hint="avatar abstract"/>
                        </div>
                        <CardTitle className="text-md font-semibold">Data-Driven Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Leverage AI for deep market understanding.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 mt-8 hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.2)]">
                    <CardHeader className="p-2">
                         <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-2 ring-1 ring-accent/30">
                            <Zap size={20} className="text-accent"/>
                        </div>
                        <CardTitle className="text-md font-semibold">AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Smart suggestions to boost digital presence.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.2)]">
                    <CardHeader className="p-2">
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-2 ring-1 ring-accent/30">
                            <BarChart2 size={20} className="text-accent"/>
                        </div>
                        <CardTitle className="text-md font-semibold">Competitive Edge</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Analyze competitors and identify opportunities.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 mt-8 hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.2)]">
                    <CardHeader className="p-2">
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-2 ring-1 ring-accent/30">
                             <Image src="https://picsum.photos/40/40" alt="Abstract Icon" width={40} height={40} className="rounded-full" data-ai-hint="technology icon"/>
                        </div>
                        <CardTitle className="text-md font-semibold">Growth Strategies</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Actionable plans for sustainable growth.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <h3 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            dangerouslySetInnerHTML={{ __html: t.markup('whyChooseTitle', { accent: (chunks) => `<span class="text-accent">${chunks}</span>` }) }}
            />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border border-border/50 hover:border-accent/50 hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.15)]">
                <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-6 px-6">
                  <div className="p-3 bg-muted/30 rounded-lg ring-1 ring-accent/30">{feature.icon}</div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="text-center py-16">
            <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm shadow-2xl p-8 md:p-12 rounded-xl border border-border/50 hover:shadow-[0_0_30px_10px_hsl(var(--accent)/0.2)] transition-all duration-300">
                <CardHeader className="p-0">
                    <CardTitle className="text-3xl md:text-4xl font-bold text-accent">{t('readyToElevateTitle')}</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg mt-4">
                        {t('readyToElevateSubtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="mt-8 p-0">
                    <Image 
                        src="https://picsum.photos/800/400" 
                        alt="Dashboard Preview" 
                        width={800} 
                        height={400}
                        className="rounded-lg shadow-xl my-6 border border-border/30"
                        data-ai-hint="dashboard interface dark" 
                    />
                </CardContent>
                <CardFooter className="flex justify-center p-0 mt-8">
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-foreground text-background hover:bg-gray-300 rounded-lg text-base font-semibold px-8 py-3 shadow-lg hover:shadow-[0_0_25px_10px_hsl(var(--accent)/0.4)] transition-all duration-300">
                            {t('dashboardButton')}
                             <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </section>
      </main>

      <footer className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground border-t border-border/30">
        <p dangerouslySetInnerHTML={{ __html: t.markup('copyright', { year: new Date().getFullYear() }) }} />
      </footer>
    </div>
  );
}
