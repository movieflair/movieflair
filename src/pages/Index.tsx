
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HomeFilterBox from '@/components/filter/HomeFilterBox';
import SEOHead from '@/components/seo/SEOHead';
import { getRandomCustomLists, CustomList } from '@/lib/api';
import CustomListCarousel from '@/components/movies/CustomListCarousel';
import PrimeVideoAd from '@/components/ads/PrimeVideoAd';

const Index = () => {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const lists = await getRandomCustomLists(2);
        setCustomLists(lists);
      } catch (error) {
        console.error('Error fetching random custom lists:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLists();
  }, []);

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
      <SEOHead 
        title="MovieFlair – Finde den perfekten Film für deine Stimmung" 
        description="Jeder Moment hat seinen Film. MovieFlair zeigt dir Filme, die zu deiner Stimmung passen – persönlich, emotional und genau im richtigen Moment." 
        keywords="filmtipps, filmempfehlungen, filme entdecken, filmfinder, filme nach stimmung, was soll ich heute schauen, passende filme, streaming tipps, movieflair, bester film für jetzt, persönlicher filmvorschlag, filme für jede laune, emotional passende filme" 
        ogType="website" 
        structuredData={websiteStructuredData} 
      />

      <section className="py-8 md:py-32 bg-gradient-to-b from-blue-50/50 to-white relative">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8 relative">
            <div className="absolute right-0 -top-12 hidden md:block">
              <img src="/lovable-uploads/3cbbc2d9-09d4-4965-abef-c43336adc68a.png" alt="MovieFlair M Logo" className="w-24 h-24" />
            </div>
            <h1 className="text-2xl lg:text-6xl tracking-tight mb-3 md:mb-6 text-theme-black font-bold md:text-5xl px-2 md:px-0">Jeder Moment hat seinen Film.
Wir finden ihn für dich!</h1>
            <p className="text-sm md:text-xl text-gray-600 mb-4 md:mb-6 font-thin px-2 md:px-0">Entdecke Filmempfehlungen, die zu deinem Tag, deiner Laune, deinem Leben passen.</p>
          </div>
          <HomeFilterBox />
          <PrimeVideoAd className="mt-6 md:mt-8" />
          {!isLoading && customLists.length > 0 && (
            <div className="mt-6 md:mt-8">
              {customLists.map(list => (
                <div key={list.id} className="bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl shadow-lg border border-gray-100 mb-4">
                  <CustomListCarousel list={list} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
