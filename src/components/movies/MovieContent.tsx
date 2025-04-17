
import React, { useState } from 'react';
import { MovieDetail } from '@/lib/types';
import { trackInteraction } from '@/lib/api';
import MovieHeader from '@/components/movies/MovieHeader';
import MovieMeta from '@/components/movies/MovieMeta';
import MovieStreamButtons from '@/components/movies/MovieStreamButtons';
import MovieBackdrop from '@/components/movies/MovieBackdrop';
import MoviePoster from '@/components/movies/MoviePoster';
import MovieTrailerDialog from '@/components/movies/MovieTrailerDialog';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import { getTrailerUrl, truncateOverview } from './MovieDetailsHelpers';

interface MovieContentProps {
  movie: MovieDetail;
  amazonAffiliateId: string;
}

export const MovieContent = ({ movie, amazonAffiliateId }: MovieContentProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  // Fix: Check if crew exists and find director, otherwise use the director property if it exists
  const director = movie.crew?.find(person => person.job === 'Director');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '';
  const trailerUrl = getTrailerUrl(movie);
  
  const handleStreamClick = () => {
    if (!movie?.streamUrl) return;
    
    if (movie?.streamUrl.includes('embed')) {
      setShowTrailer(true);
    } else {
      window.open(movie.streamUrl, '_blank');
    }
  };

  const genres = movie.genres?.map(g => g.name).join(', ') || '';

  return (
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

              {genres && (
                <div className="mb-4 text-sm">
                  <span className="font-semibold">Genres:</span> {genres}
                </div>
              )}

              <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                {truncateOverview(movie.overview)}
              </p>

              <MovieStreamButtons
                hasTrailer={movie.hasTrailer || !!trailerUrl}
                trailerUrl={trailerUrl}
                streamUrl={movie.streamUrl}
                title={movie.title}
                amazonAffiliateId={amazonAffiliateId}
                isFreeMovie={movie.isFreeMovie}
                hasStream={movie.hasStream}
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

      <MovieTrailerDialog
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={trailerUrl || ''}
        movieTitle={movie.title}
      />
    </div>
  );
};
