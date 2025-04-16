import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parseUrlSlug } from '@/lib/urlUtils';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import MainLayout from '@/components/layout/MainLayout';
import { getMovieById, getSimilarMovies, trackPageVisit } from '@/lib/api';
import type { MovieDetail as MovieDetailType, MovieOrShow } from '@/lib/types';
import SEOHead from '@/components/seo/SEOHead';
import MovieHeader from '@/components/movies/MovieHeader';
import MovieMeta from '@/components/movies/MovieMeta';
import MovieStreamButtons from '@/components/movies/MovieStreamButtons';
import MovieTrailerDialog from '@/components/movies/MovieTrailerDialog';
import MovieBackdrop from '@/components/movies/MovieBackdrop';
import MoviePoster from '@/components/movies/MoviePoster';
import MovieStructuredData from '@/components/movies/MovieStructuredData';
import MovieLoadingState from '@/components/movies/MovieLoadingState';
import MovieErrorState from '@/components/movies/MovieErrorState';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import SimilarMovies from '@/components/movies/SimilarMovies';

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
        <MovieLoadingState />
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <MovieErrorState />
      </MainLayout>
    );
  }

  const director = movie.crew?.find(person => person.job === 'Director');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '';
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
    
    if (movie?.streamUrl) {
      return movie.streamUrl;
    }
    
    return null;
  };

  const handleStreamClick = () => {
    if (!movie?.streamUrl) return;
    
    if (movie?.streamUrl.includes('embed')) {
      setShowTrailer(true);
    } else {
      window.open(movie.streamUrl, '_blank');
    }
  };

  const truncateOverview = (text: string, maxLength: number = 500) => {
    return text.length > maxLength 
      ? `${text.slice(0, maxLength)}...` 
      : text;
  };

  console.log('Movie details:', { 
    id: movie.id, 
    title: movie.title, 
    isFreeMovie: movie.isFreeMovie, 
    streamUrl: movie.streamUrl 
  });

  return (
    <MainLayout>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        ogType="movie"
        ogImage={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined}
      />
      <MovieStructuredData movie={movie} director={director} />

      <div className="min-h-screen bg-white">
        <MovieBackdrop backdropPath={movie.backdrop_path} title={movie.title} />

        <div className="container-custom -mt-20 md:-mt-40 relative z-20 px-3 md:px-8">
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="grid md:grid-cols-[300px,1fr] gap-4 md:gap-8 p-4 md:p-8">
              <div className="flex justify-center md:block">
                <MoviePoster 
                  id={movie.id} 
                  title={movie.title} 
                  posterPath={movie.poster_path}
                />
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
                  className="mb-4"
                />

                <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                  {truncateOverview(movie.overview)}
                </p>

                <MovieStreamButtons
                  hasTrailer={movie.hasTrailer}
                  trailerUrl={getTrailerUrl()}
                  streamUrl={movie.streamUrl}
                  title={movie.title}
                  amazonAffiliateId={amazonAffiliateId}
                  isFreeMovie={movie.isFreeMovie}
                  onTrailerClick={() => setShowTrailer(true)}
                  onStreamClick={handleStreamClick}
                />

                <div className="mt-6 md:mt-8">
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
        trailerUrl={getTrailerUrl() || ''}
        movieTitle={movie.title}
      />
    </MainLayout>
  );
};

export default MovieDetails;
