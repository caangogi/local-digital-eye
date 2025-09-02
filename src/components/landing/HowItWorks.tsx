
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const FeatureBlock = ({
  imageSrc,
  imageAlt,
  imageHint,
  title,
  description,
  checklist,
  reverse = false,
}: {
  imageSrc: string;
  imageAlt: string;
  imageHint: string;
  title: string;
  description: string;
  checklist: string[];
  reverse?: boolean;
}) => {
  const imageVariants = {
    hidden: { opacity: 0, x: reverse ? 100 : -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const textVariants = {
    hidden: { opacity: 0, x: reverse ? -100 : 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } },
  };

  return (
    <motion.div
      className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div className={`w-full h-80 relative rounded-lg overflow-hidden shadow-xl ${reverse ? 'md:order-last' : ''}`} variants={imageVariants}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          data-ai-hint={imageHint}
        />
      </motion.div>
      <motion.div variants={textVariants}>
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-2">
          {checklist.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};


export function HowItWorks() {
  const t = useTranslations('Home.HowItWorks');

  const blocks = [
    {
      imageSrc: "https://picsum.photos/seed/map/800/600",
      imageAlt: "Map with a pin",
      imageHint: "map pin location",
      title: t('block1.title'),
      description: t('block1.description'),
      checklist: t.raw('block1.checklist') as string[],
    },
    {
      imageSrc: "https://picsum.photos/seed/social/800/600",
      imageAlt: "Social media profiles",
      imageHint: "social media profile",
      title: t('block2.title'),
      description: t('block2.description'),
      checklist: t.raw('block2.checklist') as string[],
      reverse: true,
    },
    {
      imageSrc: "https://picsum.photos/seed/filter/800/600",
      imageAlt: "Funnel filtering prospects",
      imageHint: "funnel automation",
      title: t('block3.title'),
      description: t('block3.description'),
      checklist: t.raw('block3.checklist') as string[],
    },
    {
      imageSrc: "https://picsum.photos/seed/stars/800/600",
      imageAlt: "Five star rating",
      imageHint: "five stars rating",
      title: t('block4.title'),
      description: t('block4.description'),
      checklist: t.raw('block4.checklist') as string[],
      reverse: true,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 space-y-16 md:space-y-24">
        <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
        </motion.div>

        {blocks.map((block, index) => (
          <FeatureBlock key={index} {...block} />
        ))}
      </div>
    </section>
  );
}
