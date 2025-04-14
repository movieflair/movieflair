
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Star, Calendar, Clock, ArrowLeft, ExternalLink, PlayCircle } from 'lucide-react';
import { getMovieById, MovieDetail as MovieDetailType } from '@/lib/api';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

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

  const getTrailerKey = () => {
    if (!movie?.videos?.results) return null;
    
    const trailer = movie.videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    return trailer ? trailer.key : null;
  };

  const trailerKey = getTrailerKey();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-lg">Loading...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Movie Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the movie you're looking for.
            </p>
            <Link to="/discover" className="button-primary">
              Back to Discover
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {movie.backdrop_path ? (
          <div className="w-full h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="w-full h-[300px] bg-muted" />
        )}
        
        <div className="container-custom relative z-10 -mt-32 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Poster</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Details */}
            <div className="md:w-2/3 lg:w-3/4 pt-36">
              <Link to="/discover" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Discover
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-xl text-muted-foreground italic mb-4">
                  "{movie.tagline}"
                </p>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
                
                {movie.release_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-muted-foreground mr-1" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
                
                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-muted-foreground mr-1" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span key={genre.id} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-3">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {trailerKey && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="button-primary flex items-center"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Watch Trailer
                  </button>
                )}
                
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary flex items-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Official Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-white/80 transition-colors"
            >
              Close
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MovieDetails;
