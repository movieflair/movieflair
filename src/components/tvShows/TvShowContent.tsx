
import React, { useState } from 'react';
import { MovieDetail } from '@/lib/types';
import MovieHeader from '@/components/movies/MovieHeader';
import MovieMeta from '@/components/movies/MovieMeta';
import MovieStreamButtons from '@/components/movies/MovieStreamButtons';
import MovieBackdrop from '@/components/movies/MovieBackdrop';
import MoviePoster from '@/components/movies/MoviePoster';
import MovieTrailerDialog from '@/components/movies/MovieTrailerDialog';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import { getTrailerUrl, truncateOverview } from './TvShowDetailsHelpers';

interface TvShowContentProps {
  show: MovieDetail;
  cast: any[];
  amazonAffiliateId: string;
}

export const TvShowContent = ({ show, cast, amazonAffiliateId }: TvShowContentProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear().toString() : '';
  const trailerUrl = getTrailerUrl(show);
  
  const handleStreamClick = () => {
    if (!show?.streamUrl) return;
    
    if (show?.streamUrl.includes('embed')) {
      setShowTrailer(true);
    } else {
      window.open(show.streamUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MovieBackdrop backdropPath={show.backdrop_path} title={show.name || ''} />

      <div className="container-custom -mt-20 md:-mt-40 relative z-20 px-3 md:px-8">
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="grid md:grid-cols-[300px,1fr] gap-4 md:gap-8 p-4 md:p-8">
            <div className="flex justify-center md:block">
              <MoviePoster 
                id={show.id} 
                title={show.name || ''} 
                posterPath={show.poster_path}
              />
            </div>

            <div className="text-gray-800">
              <MovieHeader 
                title={show.name || ''}
                tagline={show.tagline}
                releaseYear={firstAirYear}
                genres={show.genres}
              />

              <MovieMeta
                year={firstAirYear}
                rating={show.vote_average}
                seasons={show.number_of_seasons}
                episodes={show.number_of_episodes}
                mediaType="tv"
                className="mb-4"
              />

              <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                {truncateOverview(show.overview)}
              </p>

              <MovieStreamButtons
                hasTrailer={show.hasTrailer}
                trailerUrl={trailerUrl}
                streamUrl={show.streamUrl}
                title={show.name || ''}
                amazonAffiliateId={amazonAffiliateId}
                isFreeMovie={show.isFreeMovie}
                hasStream={show.hasStream}
                onTrailerClick={() => setShowTrailer(true)}
                onStreamClick={handleStreamClick}
              />

              <div className="mt-6 md:mt-8">
                <CastAndCrewSection cast={cast} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MovieTrailerDialog
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={trailerUrl || ''}
        movieTitle={show.name || ''}
      />
    </div>
  );
};
