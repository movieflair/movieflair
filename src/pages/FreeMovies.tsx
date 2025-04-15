
import { useState, useEffect } from 'react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { getFreeMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { Gift } from 'lucide-react';

const FreeMovies = () => {
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track page visit
    trackPageVisit('free-movies');
    
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        console.log('FreeMovies page: Fetching free movies...');
        const data = await getFreeMovies();
        console.log('FreeMovies page: Fetched free movies:', data.length);
        console.log('FreeMovies page: Sample free movie:', data[0]);
        setMovies(data);
      } catch (error) {
        console.error('Error fetching free movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <EnhancedLayout>
      <div className="container-custom py-12">
        <div className="flex items-center mb-8">
          <Gift className="w-6 h-6 text-red-500 mr-2" />
          <h1 className="text-3xl font-semibold">Kostenlose Filme</h1>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="aspect-[2/3]">
                <div className="animate-pulse h-full">
                  <div className="bg-muted rounded-lg h-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine kostenlosen Filme gefunden. Bitte markiere Filme im Admin-Bereich als kostenlos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
};

export default FreeMovies;
