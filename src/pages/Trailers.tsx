
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getTrailerMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { PlayCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Trailers = () => {
  const [trailerItems, setTrailerItems] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Track page visit
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

  return (
    <MainLayout>
      <div className="container-custom py-12 px-4">
        <div className="flex items-center mb-8">
          <PlayCircle className="w-6 h-6 text-theme-accent-blue mr-2" />
          <h1 className="text-3xl font-semibold">Neue Trailer</h1>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(isMobile ? 2 : 4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-[2/3] rounded-lg mb-2"></div>
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {trailerItems.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Trailers;
