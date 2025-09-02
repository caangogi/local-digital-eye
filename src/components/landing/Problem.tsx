
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, PhoneIncoming, Puzzle } from "lucide-react";
import { motion } from "framer-motion";

export function Problem() {
  const t = useTranslations('Home.Problem');

  const problems = [
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: t('time.title'),
      description: t('time.description'),
    },
    {
      icon: <PhoneIncoming className="h-12 w-12 text-primary" />,
      title: t('noise.title'),
      description: t('noise.description'),
    },
    {
      icon: <Puzzle className="h-12 w-12 text-primary" />,
      title: t('marketing.title'),
      description: t('marketing.description'),
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
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
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="text-center border-none shadow-none bg-transparent">
                <CardHeader className="items-center">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    {problem.icon}
                  </div>
                  <CardTitle>{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
