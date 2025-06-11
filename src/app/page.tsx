import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart2, Users, MapPin, Search, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const features = [
    {
      icon: <Search size={24} className="text-primary" />,
      title: "Business Discovery",
      description: "Easily find and add businesses for in-depth analysis using URLs or business details.",
    },
    {
      icon: <BarChart2 size={24} className="text-primary" />,
      title: "Insightful Dashboards",
      description: "Visualize analysis with scores, sentiments, and competitor data in a clear, actionable dashboard.",
    },
    {
      icon: <Zap size={24} className="text-primary" />,
      title: "AI-Powered Recommendations",
      description: "Receive AI-driven suggestions for digital services tailored to business needs and market gaps.",
    },
    {
      icon: <Users size={24} className="text-primary" />,
      title: "Competitive Analysis",
      description: "Automatically identify and compare against direct competitors to understand market positioning.",
    },
    {
      icon: <MapPin size={24} className="text-primary" />,
      title: "Geographic Targeting",
      description: "Utilize interactive maps to search businesses by category within specific geographic zones.",
    },
    {
      icon: <CheckCircle size={24} className="text-primary" />,
      title: "Actionable Reports",
      description: "Generate comprehensive reports including diagnostics, recommendations, and competitive insights.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
          <h1 className="text-2xl font-bold font-headline text-primary">Local Digital Eye</h1>
        </div>
        <nav>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-24">
        <section className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6 text-foreground">
            Unlock Local Business Potential with AI
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Local Digital Eye provides powerful AI-driven insights to help businesses thrive in the digital landscape. Analyze, compare, and get tailored recommendations.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>

        <section className="py-16 md:py-24">
          <h3 className="text-3xl font-bold font-headline text-center mb-12 text-foreground">
            Why Choose Local Digital Eye?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  {feature.icon}
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="text-center py-16">
            <Card className="max-w-4xl mx-auto bg-card shadow-lg p-8">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-primary">Ready to Elevate Local Businesses?</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg mt-2">
                        Join Local Digital Eye today and transform how you approach digital strategy for local enterprises.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Image 
                        src="https://placehold.co/800x400.png" 
                        alt="Dashboard Preview" 
                        width={800} 
                        height={400}
                        className="rounded-lg shadow-md my-6"
                        data-ai-hint="dashboard interface dark" 
                    />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            Explore The Dashboard
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </section>

      </main>

      <footer className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Local Digital Eye. All rights reserved.</p>
      </footer>
    </div>
  );
}
