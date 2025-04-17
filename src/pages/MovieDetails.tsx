
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parseUrlSlug } from '@/lib/urlUtils';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import MainLayout from '@/components/layout/MainLayout';
import { getMovieById, getSimilarMovies, trackPageVisit, getAdminMovieById } from '@/lib/api';
import type { MovieDetail as MovieDetailType, MovieOrShow } from '@/lib/types';
import { Seo } from '@/components/seo/Seo';
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
import { toast } from 'sonner';
import { 
  formatMediaTitle, 
  formatMediaDescription, 
  getAbsoluteImageUrl,
  createCanonicalUrl
} from '@/utils/seoHelpers';

const MovieDetails = () => {
  const { id, slug } = useParams<{ id: string, slug?: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [similarMovies, setSimilarMovies] = useState<MovieOrShow[]>([]);
  
  const { amazonAffiliateId = '' } = useAdminSettings?.() || {};

  useEffect(() => {
    trackPageVisit('movie-details');
    
    const fetchMovie = async () => {
      if (!id) return;
      
      const parsedId = slug ? parseUrlSlug(id).id : parseInt(id);
      
      if (!parsedId) {
        console.error('Ungültige Film-ID');
        return;
      }

      try {
        setIsLoading(true);
        
        // Versuche zuerst, den Film aus unserer Datenbank zu laden
        const adminMovie = await getAdminMovieById(parsedId);
        
        let movieData;
        if (adminMovie) {
          console.log('Film aus lokaler Datenbank geladen:', adminMovie);
          // Für lokale Filme benötigen wir zusätzliche Details von TMDB
          const tmdbMovie = await getMovieById(parsedId);
          
          // Kombinieren der Daten, wobei lokale Daten Priorität haben
          movieData = {
            ...tmdbMovie,
            ...adminMovie,
            // Stelle sicher, dass die lokalen Pfade für Bilder verwendet werden
            poster_path: adminMovie.poster_path || tmdbMovie.poster_path,
            backdrop_path: adminMovie.backdrop_path || tmdbMovie.backdrop_path,
            // Andere wichtige Felder
            hasTrailer: adminMovie.hasTrailer,
            hasStream: adminMovie.hasStream,
            streamUrl: adminMovie.streamUrl,
            trailerUrl: adminMovie.trailerUrl,
            isFreeMovie: adminMovie.isFreeMovie,
            isNewTrailer: adminMovie.isNewTrailer,
          };
        } else {
          // Wenn nicht in unserer Datenbank, dann lade nur von TMDB
          movieData = await getMovieById(parsedId);
        }
        
        const similars = await getSimilarMovies(parsedId);
        
        setMovie(movieData);
        setSimilarMovies(similars);
      } catch (error) {
        console.error('Fehler beim Abrufen der Filmdetails:', error);
        toast.error('Fehler beim Laden des Films');
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
  
  const seoTitle = formatMediaTitle(movie.title, releaseYear);
  const seoDescription = formatMediaDescription(movie.title, releaseYear, movie.overview, 160);
  
  const seoOgImage = movie.backdrop_path && movie.backdrop_path.startsWith('/storage') 
    ? getAbsoluteImageUrl(movie.backdrop_path)
    : getAbsoluteImageUrl(
        movie.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
          : '/movieflair-logo.png'
      );
  
  const seoPath = `/film/${movie.id}${movie.title ? `/${encodeURIComponent(movie.title.toLowerCase().replace(/\s+/g, '-'))}` : ''}`;
  const canonical = createCanonicalUrl(seoPath);

  console.log('Film SEO-Daten:', { 
    title: seoTitle,
    description: seoDescription,
    image: seoOgImage,
    canonical: canonical
  });

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

  return (
    <MainLayout>
      <Seo 
        title={seoTitle}
        description={seoDescription}
        ogImage={seoOgImage}
        ogType="movie"
        canonical={canonical}
        keywords={`${movie.title}, ${movie.genres?.map(g => g.name).join(', ')}, Film Stream, Online anschauen, ${releaseYear}`}
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
