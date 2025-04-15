import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parseUrlSlug } from '@/lib/urlUtils';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Play } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { getMovieById, getSimilarMovies, trackPageVisit } from '@/lib/api';
import type { MovieDetail as MovieDetailType, MovieOrShow } from '@/lib/api';
import MovieMeta from '@/components/movies/MovieMeta';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import ShareButton from '@/components/movies/ShareButton';
import SimilarMovies from '@/components/movies/SimilarMovies';
import WatchlistButton from '@/components/movies/WatchlistButton';
import SEOHead from '@/components/seo/SEOHead';

const MovieDetails = () => {
  const { id, slug } = useParams<{ id: string, slug?: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [similarMovies, setSimilarMovies] = useState<MovieOrShow[]>([]);
  const { amazonAffiliateId } = useAdminSettings();

  useEffect(() => {
    trackPageVisit('movie-details');
    
    const fetchMovie = async () => {
      if (!id) return;
      
      const parsedId = slug ? parseUrlSlug(id).id : parseInt(id);
      
      if (!parsedId) {
        console.error('Invalid movie ID');
        return;
      }

      try {
        setIsLoading(true);
        const [movieData, similars] = await Promise.all([
          getMovieById(parsedId),
          getSimilarMovies(parsedId)
        ]);
        
        setMovie(movieData);
        setSimilarMovies(similars);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, slug]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Movie not found</div>
        </div>
      </MainLayout>
    );
  }

  const director = movie.crew?.find(person => person.job === 'Director');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const seoTitle = `${movie.title} (${releaseYear}) Online Stream anschauen | MovieFlair`;
  const seoDescription = `${movie.title} (${releaseYear}) kostenlos online streamen. ${movie.overview?.slice(0, 150)}...`;

  const getAmazonUrl = (title: string) => {
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21';
    return `https://www.amazon.de/gp/video/search?phrase=${formattedTitle}&tag=${tag}`;
  };

  const isEmbedUrl = movie.streamUrl && (
    movie.streamUrl.includes('embed') || 
    movie.streamUrl.includes('iframe') ||
    movie.streamUrl.includes('player')
  );

  const handleStreamClick = () => {
    if (!movie.streamUrl) return;
    
    if (isEmbedUrl) {
      setShowTrailer(true);
    } else {
      window.open(movie.streamUrl, '_blank');
    }
  };
  
  const getTrailerUrl = () => {
    if (movie.trailerUrl) {
      return movie.trailerUrl;
    }
    
    if (movie.videos?.results?.length > 0) {
      const firstTrailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (firstTrailer) {
        return `https://www.youtube.com/embed/${firstTrailer.key}`;
      }
    }
    
    if (isEmbedUrl) {
      return movie.streamUrl;
    }
    
    return null;
  };
  
  const trailerUrl = getTrailerUrl();

  const movieStructuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview,
    "image": movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    "datePublished": movie.release_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average,
      "ratingCount": movie.vote_count || 0,
      "bestRating": "10",
      "worstRating": "0"
    },
    "director": director ? {
      "@type": "Person",
      "name": director.name
    } : undefined,
    "actor": movie.cast?.slice(0, 5).map(actor => ({
      "@type": "Person",
      "name": actor.name
    })),
    "genre": movie.genres?.map(genre => genre.name),
    "duration": movie.runtime ? `PT${Number(movie.runtime).toString()}M` : undefined
  };

  return (
    <MainLayout>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        ogType="movie"
        ogImage={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined}
        structuredData={movieStructuredData}
      />

      <div className="min-h-screen bg-white">
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
              <div className="space-y-2">
                <div className="relative mb-2">
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
                <WatchlistButton mediaId={movie.id} mediaType="movie" />
                <ShareButton movieTitle={movie.title} />
              </div>

              <div className="text-gray-800">
                <h1 className="text-4xl font-semibold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-gray-500 mb-4 italic">
                    {movie.tagline}
                  </p>
                )}

                <MovieMeta
                  year={releaseYear}
                  rating={movie.vote_average}
                  duration={movie.runtime}
                  mediaType="movie"
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
                  {movie.hasTrailer && trailerUrl && (
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
                    className="bg-[rgba(26,152,255,255)] text-white px-6 py-2 rounded-md hover:bg-[rgba(26,152,255,255)]/90 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Prime Video
                  </a>
                  {movie.streamUrl && (
                    <button
                      className="bg-[#ea384c] text-white px-6 py-2 rounded-md hover:bg-[#ea384c]/90 transition-colors flex items-center gap-2"
                      onClick={handleStreamClick}
                    >
                      <Play className="w-4 h-4" />
                      Kostenlos
                    </button>
                  )}
                </div>

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

      <SimilarMovies movies={similarMovies} />

      {showTrailer && trailerUrl && (
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
                src={trailerUrl}
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
