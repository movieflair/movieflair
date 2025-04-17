import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Youtube } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { getTrailerMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import TrailerCard from '@/components/movies/TrailerCard';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';

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
        <div className="flex items-center gap-2 mb-6">
          <Link to="/entdecken" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zurück zu Entdecken
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
          
          {trailerItems.length > 0 && trailerItems[0].backdrop_path && (
            <div className="absolute inset-0">
              <img 
                src={`https://image.tmdb.org/t/p/w1280${trailerItems[0].backdrop_path}`} 
                alt="Neue Trailer"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
          )}
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Neue Trailer</h1>
                <p className="text-white/80 max-w-2xl text-lg">
                  Entdecke die neuesten Trailer zu kommenden Filmen und Serien – Alle Trailer auf einen Blick. Immer aktuell.
                </p>
              </div>
              
              <Button 
                asChild
                variant="secondary"
                className="flex items-center gap-2"
              >
                <a 
                  href="https://www.youtube.com/@movieflair_trailer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Youtube className="w-5 h-5" />
                  MovieFlair Trailer
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {isLoading ? 'Lade Trailer...' : `${trailerItems.length} neue Trailer`}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted aspect-video rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : trailerItems.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-background/50">
              <p className="text-muted-foreground">Keine neuen Trailer gefunden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trailerItems.map((item) => (
                <TrailerCard key={item.id} movie={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Trailers;
