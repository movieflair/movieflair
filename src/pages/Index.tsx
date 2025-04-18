import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import HomeFilterBox from '@/components/filter/HomeFilterBox';
import { Seo } from '@/components/seo/Seo';
import { getRandomCustomLists, getRandomMovie } from '@/lib/api';
import { CustomList, MovieOrShow } from '@/lib/types';
import CustomListCarousel from '@/components/movies/CustomListCarousel';
import PrimeVideoAd from '@/components/ads/PrimeVideoAd';
import LastRecommendationHeader from '@/components/filter/LastRecommendationHeader';

const Index = () => {
  const [customList, setCustomList] = useState<CustomList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [randomMovie, setRandomMovie] = useState<MovieOrShow | null>(null);

  useEffect(() => {
    const fetchRandomMovie = async () => {
      try {
        const movie = await getRandomMovie();
        setRandomMovie(movie);
      } catch (error) {
        console.error('Error fetching random movie:', error);
      }
    };
    fetchRandomMovie();
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      try {
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
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
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

  return <MainLayout>
      <Seo structuredData={websiteStructuredData} />

      <section className="py-12 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-theme-accent-red/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{
        animationDelay: "1s"
      }}></div>

        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <LastRecommendationHeader recommendation={randomMovie} />
          
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-6 md:mb-8 relative" 
            initial="hidden" 
            animate="visible" 
            variants={fadeInUpVariants}
          >
            <motion.h1 
              variants={fadeInUpVariants} 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 
                         tracking-tight mb-3 md:mb-6 
                         text-theme-black font-bold 
                         break-words leading-tight"
            >
              Jeder Moment{" "}
              <br className="block sm:hidden" />
              hat seinen Film.{" "}
              <br />
              Wir finden ihn für dich!
            </motion.h1>
            <motion.p className="text-sm md:text-xl text-gray-600 mb-4 md:mb-6 font-thin px-2 md:px-0" variants={fadeInUpVariants} transition={{
            delay: 0.2
          }}>
              Entdecke Filmempfehlungen, die zu deinem Tag, deiner Laune, deinem Leben passen.
            </motion.p>
          </motion.div>
          
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3,
          duration: 0.6
        }}>
            <HomeFilterBox onRecommendation={setRandomMovie} />
          </motion.div>
          
          <PrimeVideoAd className="mt-6 md:mt-8" />
          
          {!isLoading && customList && <motion.div className="mt-8 md:mt-12" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.6,
          duration: 0.8
        }}>
              <CustomListCarousel list={customList} />
            </motion.div>}
        </div>
      </section>
    </MainLayout>;
};

export default Index;
