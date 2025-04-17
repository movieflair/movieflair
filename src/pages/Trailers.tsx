
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getTrailerMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import { Seo } from '@/components/seo/Seo';
import TrailersHero from '@/components/trailers/TrailersHero';
import TrailersGrid from '@/components/trailers/TrailersGrid';
import { toast } from "@/hooks/use-toast";

const Trailers = () => {
  const [trailerItems, setTrailerItems] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackPageVisit('trailers');
    
    const fetchTrailerItems = async () => {
      try {
        setIsLoading(true);
        console.log('Trailers page: Fetching trailer items...');
        const data = await getTrailerMovies();
        console.log('Trailers page: Fetched trailer items:', data.length);
        setTrailerItems(data);
      } catch (error) {
        console.error('Error fetching trailers:', error);
        toast({
          title: "Fehler",
          description: "Trailer konnten nicht geladen werden. Bitte versuche es später erneut.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrailerItems();
  }, []);

  const seoTitle = "Neue Film & Serien Trailer Online anschauen | MovieFlair";
  const seoDescription = "Neue Film & Serien Trailer Online anschauen - Entdecke die aktuellsten Trailer für kommende Filme und Serien";
  const featuredBackdrop = trailerItems[0]?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${trailerItems[0].backdrop_path}` 
    : '/movieflair-logo.png';

  console.log(`Trailers page rendering with ${trailerItems.length} items`);
  
  return (
    <MainLayout>
      <Seo 
        title={seoTitle}
        description={seoDescription}
        ogImage={featuredBackdrop}
        ogType="website"
        keywords="Filmtrailer, Serientrailer, neue Trailer, Kinotrailer, Online Stream, Trailer anschauen"
      />

      <div className="container-custom py-8">
        <TrailersHero trailerItems={trailerItems} />
        <TrailersGrid trailerItems={trailerItems} isLoading={isLoading} />
      </div>
    </MainLayout>
  );
};

export default Trailers;
