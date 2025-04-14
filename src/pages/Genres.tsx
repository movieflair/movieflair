
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getGenres, Genre, getRecommendationByFilters, MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { trackPageVisit } from '@/lib/api';

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackPageVisit('genres');
    
    const fetchGenres = async () => {
      try {
        const genresList = await getGenres();
        setGenres(genresList);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreClick = async (genreId: number) => {
    setIsLoading(true);
    setSelectedGenre(genreId);
    
    try {
      const results = await getRecommendationByFilters({
        genres: [genreId],
        mediaType: 'movie'
      });
      
      setMovies(results);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-semibold mb-8">Filme nach Genre entdecken</h1>
        
        <div className="mb-8 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={`px-4 py-2 rounded-full ${
                selectedGenre === genre.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-gray-600">Lade Filme...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
        
        {!isLoading && selectedGenre && movies.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-gray-600">Keine Filme für dieses Genre gefunden.</p>
          </div>
        )}
        
        {!selectedGenre && (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-gray-600">Wählen Sie ein Genre aus, um Filme anzuzeigen.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Genres;
