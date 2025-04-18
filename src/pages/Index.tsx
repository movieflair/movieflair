
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import HomeFilterBox from '@/components/filter/HomeFilterBox';
import { Seo } from '@/components/seo/Seo';
import { getRandomCustomLists } from '@/lib/api';
import { CustomList } from '@/lib/types';
import CustomListCarousel from '@/components/movies/CustomListCarousel';
import PrimeVideoAd from '@/components/ads/PrimeVideoAd';
import FeaturedMovies from '@/components/movies/FeaturedMovies';
import { Film, Sparkles } from 'lucide-react';

const Index = () => {
  const [customList, setCustomList] = useState<CustomList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchList = async () => {
      try {
        // Get a truly random list for the homepage
        const lists = await getRandomCustomLists(1, true);
        setCustomList(lists[0] || null);
      } catch (error) {
        console.error('Error fetching random custom list:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchList();
  }, []);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MovieFlair – Finde den perfekten Film für deine Stimmung",
    "url": "https://movieflair.co",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://movieflair.co/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <MainLayout>
      <Seo 
        structuredData={websiteStructuredData} 
        keywords="filmtipps, filmempfehlungen, filme entdecken, filmfinder, filme nach stimmung, was soll ich heute schauen, passende filme, streaming tipps, movieflair, bester film für jetzt, persönlicher filmvorschlag, filme für jede laune, emotional passende filme" 
      />

      <section className="py-8 md:py-24 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-theme-accent-red/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-6 md:mb-8 relative"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
          >
            <div className="absolute right-0 md:right-[-50px] -top-10 md:-top-14 hidden md:block">
              <motion.img 
                src="/lovable-uploads/3cbbc2d9-09d4-4965-abef-c43336adc68a.png" 
                alt="MovieFlair M Logo" 
                className="w-24 h-24" 
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              />
            </div>
            <motion.h1 
              className="text-2xl lg:text-6xl tracking-tight mb-3 md:mb-6 text-theme-black font-bold md:text-5xl px-2 md:px-0"
              variants={fadeInUpVariants}
            >
              <span className="relative inline-block">
                Jeder Moment 
                <motion.span 
                  className="absolute -top-6 -right-6 text-theme-accent-red"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.span>
              </span>{" "}
              hat seinen Film.
              <br />Wir finden ihn für dich!
            </motion.h1>
            <motion.p 
              className="text-sm md:text-xl text-gray-600 mb-4 md:mb-6 font-thin px-2 md:px-0"
              variants={fadeInUpVariants}
              transition={{ delay: 0.2 }}
            >
              Entdecke Filmempfehlungen, die zu deinem Tag, deiner Laune, deinem Leben passen.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <HomeFilterBox />
          </motion.div>
          
          <PrimeVideoAd className="mt-6 md:mt-8" />
          
          {!isLoading && customList && (
            <motion.div 
              className="mt-8 md:mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <CustomListCarousel list={customList} />
            </motion.div>
          )}
          
          <motion.div 
            className="mt-12 md:mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Film className="w-6 h-6 text-theme-accent-red" />
              <h2 className="text-2xl font-bold">Highlights für dich</h2>
            </div>
            <FeaturedMovies />
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
