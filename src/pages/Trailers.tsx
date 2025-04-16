
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getTrailerMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { PlayCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import SEOHead from '@/components/seo/SEOHead';
import { DEFAULT_SEO, formatListTitle, formatListDescription, getAbsoluteImageUrl } from '@/utils/seoHelpers';

const Trailers = () => {
  const [trailerItems, setTrailerItems] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    trackPageVisit('trailers');
    
    const fetchTrailerItems = async () => {
      try {
        setIsLoading(true);
        console.log('Trailers page: Fetching trailer items...');
        const data = await getTrailerMovies();
        console.log('Trailers page: Fetched trailer items:', data.length);
        if (data.length > 0) {
          console.log('Trailers page: Sample trailer item:', data[0]);
        }
        setTrailerItems(data);
      } catch (error) {
        console.error('Error fetching trailers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrailerItems();
  }, []);

  const seoTitle = formatListTitle("Neue Film & Serien Trailer");
  const seoDescription = formatListDescription(
    "Neue Film & Serien Trailer", 
    "Entdecke die aktuellsten Trailer für kommende Filme und Serien"
  );
  
  const featuredBackdrop = trailerItems[0]?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${trailerItems[0].backdrop_path}` 
    : DEFAULT_SEO.ogImage;
  
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/neue-trailer` : '';

  return (
    <MainLayout>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        ogImage={featuredBackdrop}
        ogType="website"
        canonical={canonical}
        keywords="Filmtrailer, Serientrailer, neue Trailer, Kinotrailer, Online Stream, Trailer anschauen"
      />

      <div className="container-custom py-12 px-4">
        <div className="flex items-center mb-8">
          <PlayCircle className="w-6 h-6 text-theme-accent-blue mr-2" />
          <h1 className="text-3xl font-semibold">Neue Trailer</h1>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(isMobile ? 2 : 4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-[2/3] rounded-lg mb-2 h-[300px]"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : trailerItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine neuen Trailer gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trailerItems.map((item) => (
              <MovieCard key={item.id} movie={item} size="medium" />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Trailers;
