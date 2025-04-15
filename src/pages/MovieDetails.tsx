import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parseUrlSlug } from '@/lib/urlUtils';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import MainLayout from '@/components/layout/MainLayout';
import { getMovieById, getSimilarMovies, trackPageVisit } from '@/lib/api';
import type { MovieDetail as MovieDetailType, MovieOrShow } from '@/lib/api';
import MovieMeta from '@/components/movies/MovieMeta';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import ShareButton from '@/components/movies/ShareButton';
import SimilarMovies from '@/components/movies/SimilarMovies';
import WatchlistButton from '@/components/movies/WatchlistButton';
import SEOHead from '@/components/seo/SEOHead';
import MovieHeader from '@/components/movies/MovieHeader';
import MovieStreamButtons from '@/components/movies/MovieStreamButtons';
import MovieTrailerDialog from '@/components/movies/MovieTrailerDialog';
import MovieBackdrop from '@/components/movies/MovieBackdrop';

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

  const getTrailerUrl = () => {
    if (movie?.trailerUrl) {
      return movie.trailerUrl;
    }
    
    if (movie?.videos?.results?.length > 0) {
      const firstTrailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (firstTrailer) {
        return `https://www.youtube.com/embed/${firstTrailer.key}`;
      }
    }
    
    if (isEmbedUrl && movie?.streamUrl) {
      return movie.streamUrl;
    }
    
    return null;
  };

  const handleStreamClick = () => {
    if (!movie?.streamUrl) return;
    
    if (isEmbedUrl) {
      setShowTrailer(true);
    } else {
      window.open(movie.streamUrl, '_blank');
    }
  };

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
    "duration": movie.runtime ? `PT${String(movie.runtime)}M` : undefined
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
        <MovieBackdrop backdropPath={movie.backdrop_path} title={movie.title} />

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
                <MovieHeader 
                  title={movie.title}
                  tagline={movie.tagline}
                  releaseYear={releaseYear}
                  genres={movie.genres}
                />

                <MovieMeta
                  year={releaseYear}
                  rating={movie.vote_average}
                  duration={movie.runtime}
                  mediaType="movie"
                />

                <p className="text-gray-600 mb-8 leading-relaxed">
                  {movie.overview}
                </p>

                <MovieStreamButtons
                  hasTrailer={movie.hasTrailer}
                  trailerUrl={trailerUrl}
                  streamUrl={movie.streamUrl}
                  title={movie.title}
                  amazonAffiliateId={amazonAffiliateId}
                  onTrailerClick={() => setShowTrailer(true)}
                  onStreamClick={handleStreamClick}
                />

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

      <MovieTrailerDialog
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={trailerUrl || ''}
        movieTitle={movie.title}
      />
    </MainLayout>
  );
};

export default MovieDetails;
