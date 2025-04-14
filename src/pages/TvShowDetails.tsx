
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Star, Calendar, ArrowLeft, ExternalLink, PlayCircle, ShoppingCart } from 'lucide-react';
import { getTvShowById, MovieDetail as TvShowDetailType } from '@/lib/api';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const TvShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TvShowDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { amazonAffiliateId } = useAdminSettings();

  useEffect(() => {
    const fetchTvShow = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getTvShowById(parseInt(id));
        setTvShow(data);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTvShow();
  }, [id]);

  const getTrailerKey = () => {
    if (!tvShow?.videos?.results) return null;
    
    const trailer = tvShow.videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    return trailer ? trailer.key : null;
  };

  const trailerKey = getTrailerKey();
  
  const getAmazonUrl = (title: string) => {
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21'; // Default tag if not set
    return `https://www.amazon.de/s?k=${formattedTitle}&tag=${tag}`;
  };

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

  if (!tvShow) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Serie nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Wir konnten die gesuchte Serie leider nicht finden.
            </p>
            <Link to="/" className="button-primary">
              Zurück zur Startseite
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
        {tvShow.backdrop_path ? (
          <div className="w-full h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
            <img
              src={`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`}
              alt={tvShow.name}
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
                {tvShow.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                    alt={tvShow.name}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">Kein Poster</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Details */}
            <div className="md:w-2/3 lg:w-3/4 pt-36">
              <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Zurück zur Startseite
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">{tvShow.name}</h1>
              
              {tvShow.tagline && (
                <p className="text-xl text-muted-foreground italic mb-4">
                  "{tvShow.tagline}"
                </p>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-medium">{tvShow.vote_average.toFixed(1)}</span>
                </div>
                
                {tvShow.first_air_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-muted-foreground mr-1" />
                    <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {tvShow.genres?.map((genre) => (
                  <span key={genre.id} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-3">Übersicht</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {tvShow.overview || 'Keine Beschreibung verfügbar.'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {trailerKey && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="button-primary flex items-center"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Trailer ansehen
                  </button>
                )}
                
                {tvShow.homepage && (
                  <a
                    href={tvShow.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary flex items-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Offizielle Website
                  </a>
                )}
                
                <a
                  href={getAmazonUrl(tvShow.name || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FF9900] text-white rounded-full px-5 py-2.5 font-medium transition-all hover:bg-[#FF9900]/90 flex items-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Bei Amazon Prime ansehen
                </a>
              </div>
              
              {/* Stream Section - Only shown if hasStream is true */}
              {tvShow.hasStream && tvShow.streamUrl && (
                <div className="mt-8">
                  <h2 className="text-xl font-medium mb-4">Stream ansehen</h2>
                  <div className="aspect-video w-full max-w-3xl bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={tvShow.streamUrl}
                      title={`${tvShow.name} Stream`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay"
                    ></iframe>
                  </div>
                </div>
              )}
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
              Schließen
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

export default TvShowDetails;
