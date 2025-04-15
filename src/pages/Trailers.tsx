
import { useState, useEffect } from 'react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { getTrailerMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { PlayCircle } from 'lucide-react';

const Trailers = () => {
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track page visit
    trackPageVisit('trailers');
    
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        console.log('Trailers page: Fetching trailer movies...');
        const data = await getTrailerMovies();
        console.log('Trailers page: Fetched trailer movies:', data.length);
        console.log('Trailers page: Sample trailer movie:', data[0]);
        setMovies(data);
      } catch (error) {
        console.error('Error fetching trailers:', error);
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
          <PlayCircle className="w-6 h-6 text-theme-accent-blue mr-2" />
          <h1 className="text-3xl font-semibold">Neue Trailer</h1>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-[2/3] rounded-lg mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine neuen Trailer gefunden. Bitte markiere Filme im Admin-Bereich als neue Trailer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
};

export default Trailers;
