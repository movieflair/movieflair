
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
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gray-50">
      <MovieBackdrop backdropPath={movie.backdrop_path} title={movie.title} />

      <div className="container mx-auto -mt-20 md:-mt-40 relative z-20 px-4 md:px-6 max-w-7xl">
        <Card className="overflow-hidden shadow-lg border-0">
          <div className="grid md:grid-cols-[280px,1fr] gap-6 md:gap-8 p-6 md:p-8">
            <div className="flex justify-center md:block">
              <MoviePoster 
                id={movie.id} 
                title={movie.title} 
                posterPath={movie.poster_path}
              />
            </div>

            <div className="space-y-6">
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
                className="mt-2"
              />

              {genres && (
                <div className="text-sm">
                  <span className="font-semibold">Genres:</span> {genres}
                </div>
              )}

              <Card className="bg-white shadow-sm border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-2">Handlung</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {movie.overview}
                  </p>
                </CardContent>
              </Card>

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

              <Card className="bg-white shadow-sm border">
                <CardContent className="p-6">
                  <CastAndCrewSection 
                    director={director}
                    cast={movie.cast?.filter(person => person.character)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
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
