
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { getMovieById } from '@/lib/api';
import type { MovieDetail as MovieDetailType } from '@/lib/api';
import MovieMeta from '@/components/movies/MovieMeta';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Play, CirclePlay, ShoppingCart } from 'lucide-react';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { amazonAffiliateId } = useAdminSettings();

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getMovieById(parseInt(id));
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (isLoading || !movie) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  // Find the director from the crew
  const director = movie.crew?.find(person => person.job === 'Director');
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
  
  const getAmazonUrl = (title: string) => {
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21';
    return `https://www.amazon.de/gp/video/search?phrase=${formattedTitle}&tag=${tag}`;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section with Backdrop */}
        <div className="relative h-[400px] overflow-hidden">
          {movie.backdrop_path ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        <div className="container-custom -mt-40 relative z-20">
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="grid md:grid-cols-[300px,1fr] gap-8 p-8">
              {/* Poster */}
              <div>
                <div className="rounded-lg overflow-hidden shadow-xl">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full"
                    />
                  ) : (
                    <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Kein Poster</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="text-gray-800">
                <h1 className="text-4xl font-semibold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-gray-500 mb-4 italic">
                    {movie.tagline}
                  </p>
                )}

                <MovieMeta
                  year={year?.toString()}
                  rating={movie.vote_average}
                  duration={movie.runtime}
                />

                <div className="flex flex-wrap gap-2 my-6">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-1 bg-gray-100 text-gray-700 rounded-md"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  {movie.overview}
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {movie.videos?.results.length > 0 && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Trailer
                    </button>
                  )}
                  <a
                    href={getAmazonUrl(movie.title || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <CirclePlay className="w-5 h-5 mr-2" />
                    Bei Prime Video ansehen
                  </a>
                  {movie.hasStream && (
                    <button
                      className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => setShowTrailer(true)}
                    >
                      Stream ansehen
                    </button>
                  )}
                </div>

                {/* Cast and Crew Section */}
                <div className="mt-8">
                  <CastAndCrewSection 
                    director={director}
                    cast={movie.cast?.filter(person => person.character)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (movie.videos?.results[0]?.key || movie.streamUrl) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-white/80"
            >
              Schließen
            </button>
            <div className="aspect-video">
              <iframe
                src={movie.streamUrl || `https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                title={`${movie.title} Stream`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MovieDetails;
