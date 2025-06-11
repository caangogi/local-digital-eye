import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart2, Users, MapPin, Search, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const features = [
    {
      icon: <Search size={20} className="text-accent" />,
      title: "Business Discovery",
      description: "Easily find and add businesses for in-depth analysis using URLs or business details.",
    },
    {
      icon: <BarChart2 size={20} className="text-accent" />,
      title: "Insightful Dashboards",
      description: "Visualize analysis with scores, sentiments, and competitor data in a clear, actionable dashboard.",
    },
    {
      icon: <Zap size={20} className="text-accent" />,
      title: "AI-Powered Recommendations",
      description: "Receive AI-driven suggestions for digital services tailored to business needs and market gaps.",
    },
    {
      icon: <Users size={20} className="text-accent" />,
      title: "Competitive Analysis",
      description: "Automatically identify and compare against direct competitors to understand market positioning.",
    },
    {
      icon: <MapPin size={20} className="text-accent" />,
      title: "Geographic Targeting",
      description: "Utilize interactive maps to search businesses by category within specific geographic zones.",
    },
    {
      icon: <CheckCircle size={20} className="text-accent" />,
      title: "Actionable Reports",
      description: "Generate comprehensive reports including diagnostics, recommendations, and competitive insights.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Radial gradient background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[80vw] h-[80vh] md:w-[60vw] md:h-[70vh] opacity-50"
             style={{
               background: 'radial-gradient(ellipse at bottom right, hsl(var(--accent) / 0.4) 0%, hsl(var(--background)) 70%)',
             }}>
        </div>
      </div>

      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground group-hover:text-accent transition-colors">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
          <h1 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">Local Digital Eye</h1>
        </Link>
        <nav>
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/5">Login</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-6 py-16 md:py-24">
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Unlock Local Business Potential <span className="text-accent">with AI</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10">
              Local Digital Eye provides powerful AI-driven insights to help businesses thrive in the digital landscape. Analyze, compare, and get tailored recommendations.
            </p>
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-foreground text-background hover:bg-gray-300 rounded-lg text-base font-semibold px-8 py-3"
              >
                Open your Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="hidden md:flex justify-center items-center relative">
            {/* Placeholder for floating cards similar to screenshot */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <CardHeader className="p-2">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                            <Image src="https://placehold.co/40x40.png" alt="User Avatar" width={40} height={40} className="rounded-full" data-ai-hint="avatar abstract"/>
                        </div>
                        <CardTitle className="text-md font-semibold">Data-Driven Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Leverage AI for deep market understanding.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 mt-8">
                    <CardHeader className="p-2">
                         <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                            <Zap size={20} className="text-accent"/>
                        </div>
                        <CardTitle className="text-md font-semibold">AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Smart suggestions to boost digital presence.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <CardHeader className="p-2">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                            <BarChart2 size={20} className="text-accent"/>
                        </div>
                        <CardTitle className="text-md font-semibold">Competitive Edge</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">Analyze competitors and identify opportunities.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 mt-8">
                    <CardHeader className="p-2">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                             <Image src="https://placehold.co/40x40.png" alt="Abstract Icon" width={40} height={40} className="rounded-full" data-ai-hint="technology icon"/>
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
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-accent">Local Digital Eye</span>?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border border-border/50 hover:border-accent/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-6 px-6">
                  <div className="p-3 bg-muted rounded-lg">{feature.icon}</div>
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
            <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm shadow-2xl p-8 md:p-12 rounded-xl border border-border/50">
                <CardHeader className="p-0">
                    <CardTitle className="text-3xl md:text-4xl font-bold text-accent">Ready to Elevate Local Businesses?</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg mt-4">
                        Join Local Digital Eye today and transform how you approach digital strategy for local enterprises.
                    </CardDescription>
                </CardHeader>
                <CardContent className="mt-8 p-0">
                    <Image 
                        src="https://placehold.co/800x400.png" 
                        alt="Dashboard Preview" 
                        width={800} 
                        height={400}
                        className="rounded-lg shadow-xl my-6 border border-border/30"
                        data-ai-hint="dashboard interface dark" 
                    />
                </CardContent>
                <CardFooter className="flex justify-center p-0 mt-8">
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-foreground text-background hover:bg-gray-300 rounded-lg text-base font-semibold px-8 py-3">
                            Explore The Dashboard
                             <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </section>

      </main>

      <footer className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground border-t border-border/30">
        <p>&copy; {new Date().getFullYear()} Local Digital Eye. All rights reserved.</p>
      </footer>
    </div>
  );
}
