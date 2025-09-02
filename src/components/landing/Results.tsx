
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlarmClock, Users, Smile } from "lucide-react";
import { motion } from "framer-motion";

export function Results() {
  const t = useTranslations('Home.Results');

  const results = [
    {
      icon: <AlarmClock className="h-10 w-10 text-primary" />,
      title: t('time.title'),
      description: t('time.description'),
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: t('quality.title'),
      description: t('quality.description'),
    },
    {
      icon: <Smile className="h-10 w-10 text-primary" />,
      title: t('peace.title'),
      description: t('peace.description'),
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12">{t('title')}</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {results.map((result, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="text-center bg-muted/30 border p-6 h-full">
                <CardHeader className="items-center p-0">
                  <div className="p-3 bg-card rounded-full mb-4 border">
                    {result.icon}
                  </div>
                  <CardTitle className="text-4xl font-extrabold text-primary">{result.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <p className="text-muted-foreground">{result.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
