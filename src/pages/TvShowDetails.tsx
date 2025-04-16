import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { MovieDetail } from '@/lib/types';
import { getTvShowDetails, getCast } from '@/lib/tvShowApi';
import SEOHead from '@/components/seo/SEOHead';
import { formatMediaTitle, formatMediaDescription, getAbsoluteImageUrl } from '@/utils/seoHelpers';
import MovieMeta from '@/components/movies/MovieMeta';
import MovieHeader from '@/components/movies/MovieHeader';
import MovieStreamButtons from '@/components/movies/MovieStreamButtons';
import MovieTrailerDialog from '@/components/movies/MovieTrailerDialog';
import MovieBackdrop from '@/components/movies/MovieBackdrop';
import MoviePoster from '@/components/movies/MoviePoster';
import MovieLoadingState from '@/components/movies/MovieLoadingState';
import MovieErrorState from '@/components/movies/MovieErrorState';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import SimilarMovies from '@/components/movies/SimilarMovies';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const TvShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { amazonAffiliateId } = useAdminSettings();

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!id) {
        console.error('No ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const showData = await getTvShowDetails(id);
        const castData = await getCast(id, 'tv');

        setShow(showData);
        setCast(castData);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <MovieLoadingState />
      </MainLayout>
    );
  }

  if (!show) {
    return (
      <MainLayout>
        <MovieErrorState />
      </MainLayout>
    );
  }

  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear().toString() : '';
  
  const seoTitle = formatMediaTitle(show.name || '', firstAirYear);
  const seoDescription = formatMediaDescription(show.name || '', firstAirYear, show.overview);
  const seoOgImage = show.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : '/movieflair-logo.png';
  const canonical = `${window.location.origin}/serie/${show.id}${show.name ? `/${encodeURIComponent(show.name.toLowerCase().replace(/\s+/g, '-'))}` : ''}`;

  console.log('TV Show SEO data:', { 
    title: seoTitle,
    description: seoDescription,
    image: seoOgImage,
    canonical: canonical
  });

  const getTrailerUrl = () => {
    if (show?.trailerUrl) {
      return show.trailerUrl;
    }
    
    if (show?.videos?.results?.length > 0) {
      const firstTrailer = show.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (firstTrailer) {
        return `https://www.youtube.com/embed/${firstTrailer.key}`;
      }
    }
    
    if (show?.streamUrl) {
      return show.streamUrl;
    }
    
    return null;
  };

  const handleStreamClick = () => {
    if (!show?.streamUrl) return;
    
    if (show?.streamUrl.includes('embed')) {
      setShowTrailer(true);
    } else {
      window.open(show.streamUrl, '_blank');
    }
  };

  const truncateOverview = (text: string, maxLength: number = 500) => {
    return text.length > maxLength 
      ? `${text.slice(0, maxLength)}...` 
      : text;
  };

  console.log('TV Show details:', { 
    id: show.id, 
    name: show.name, 
    hasStream: show.hasStream, 
    streamUrl: show.streamUrl,
    isFreeMovie: show.isFreeMovie
  });

  return (
    <MainLayout>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        ogType="tv_show"
        ogImage={seoOgImage}
        canonical={canonical}
        keywords={`${show.name}, ${show.genres?.map(g => g.name).join(', ')}, Serie Stream, Online anschauen, ${firstAirYear}`}
      />

      <div className="min-h-screen bg-white">
        <MovieBackdrop backdropPath={show.backdrop_path} title={show.name} />

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
                  trailerUrl={getTrailerUrl()}
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
      </div>

      <MovieTrailerDialog
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={getTrailerUrl() || ''}
        movieTitle={show.name || ''}
      />
    </MainLayout>
  );
};

export default TvShowDetails;
