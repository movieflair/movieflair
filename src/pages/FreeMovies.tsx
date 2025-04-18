import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shuffle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { getFreeMovies, MovieOrShow, trackPageVisit } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Seo } from '@/components/seo/Seo';

const FreeMovies = () => {
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    trackPageVisit('free-movies');
    
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        console.log('FreeMovies page: Fetching free movies...');
        const data = await getFreeMovies();
        console.log('FreeMovies page: Fetched free movies:', data.length);
        setMovies(data);
      } catch (error) {
        console.error('Error fetching free movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleRandomMovie = () => {
    if (movies.length > 0) {
      const randomIndex = Math.floor(Math.random() * movies.length);
      const randomMovie = movies[randomIndex];
      navigate(`/film/${randomMovie.id}`);
    }
  };

  const seoTitle = "Kostenlose Filme Online anschauen | MovieFlair";
  const seoDescription = "Kostenlose Filme Online anschauen - Entdecke eine kuratierte Auswahl an Filmen, die du komplett kostenlos und legal streamen kannst.";
  const featuredBackdrop = movies[0]?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movies[0].backdrop_path}` 
    : '/movieflair-logo.png';

  return (
    <MainLayout>
      <Seo 
        title={seoTitle}
        description={seoDescription}
        ogImage={featuredBackdrop}
        ogType="website"
        keywords="kostenlose Filme, gratis Filme, legale Streams, Filme kostenlos anschauen, Free Movies"
      />

      <div className="container-custom py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {isLoading ? 'Lade Filme...' : `${movies.length} kostenlose Filme`}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted aspect-[2/3] rounded-lg mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-background/50">
              <p className="text-muted-foreground">Keine kostenlosen Filme gefunden</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FreeMovies;
