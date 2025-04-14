
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Play, Video } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { getTvShowById, MovieDetail, trackPageVisit } from '@/lib/api';
import MovieMeta from '@/components/movies/MovieMeta';
import CastAndCrewSection from '@/components/movies/CastAndCrewSection';
import ShareButton from '@/components/movies/ShareButton';

type TvShowDetailType = MovieDetail;

const TvShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TvShowDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { amazonAffiliateId } = useAdminSettings();

  useEffect(() => {
    // Seiten-Aufruf tracken
    trackPageVisit('tv-show-details');
    
    const fetchTvShow = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getTvShowById(parseInt(id));
        
        const savedShows = localStorage.getItem('adminShows');
        if (savedShows) {
          const parsedShows = JSON.parse(savedShows);
          const savedShow = parsedShows.find((s: any) => s.id === data.id);
          if (savedShow) {
            data.hasStream = savedShow.hasStream;
            data.streamUrl = savedShow.streamUrl;
            data.hasTrailer = savedShow.hasTrailer;
            data.trailerUrl = savedShow.trailerUrl;
          }
        }
        
        setTvShow(data);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTvShow();
  }, [id]);

  // Bestimme die richtige Trailer-URL
  const getTrailerUrl = () => {
    if (!tvShow) return null;
    
    // Priorisiere die benutzerdefinierte Trailer-URL
    if (tvShow.trailerUrl) {
      return tvShow.trailerUrl;
    }
    
    // Ansonsten verwende den ersten YouTube-Trailer aus den API-Daten
    if (tvShow.videos?.results?.length > 0) {
      const trailer = tvShow.videos.results.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      if (trailer) {
        return `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    
    // Wenn keine URL gefunden wurde, verwende den Stream als Fallback
    if (tvShow.streamUrl && (
      tvShow.streamUrl.includes('embed') || 
      tvShow.streamUrl.includes('iframe') ||
      tvShow.streamUrl.includes('player')
    )) {
      return tvShow.streamUrl;
    }
    
    return null;
  };

  const trailerUrl = getTrailerUrl();
  
  const getAmazonUrl = (title: string) => {
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21'; // Default tag if not set
    return `https://www.amazon.de/s?k=${formattedTitle}&tag=${tag}`;
  };

  const isEmbedUrl = tvShow?.streamUrl && (
    tvShow.streamUrl.includes('embed') || 
    tvShow.streamUrl.includes('iframe') ||
    tvShow.streamUrl.includes('player')
  );

  const handleStreamClick = () => {
    if (!tvShow?.streamUrl) return;
    
    if (isEmbedUrl) {
      setShowTrailer(true);
    } else {
      window.open(tvShow.streamUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading...</div>
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

  const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : undefined;
  const creator = tvShow.crew?.find(person => person.job === 'Creator' || person.job === 'Executive Producer');

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="relative h-[400px] overflow-hidden">
          {tvShow.backdrop_path ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
              <img
                src={`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`}
                alt={tvShow.name}
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
              <div className="space-y-4">
                <div className="relative">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    {tvShow.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                        alt={tvShow.name}
                        className="w-full"
                      />
                    ) : (
                      <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Kein Poster</span>
                      </div>
                    )}
                  </div>
                </div>
                <ShareButton movieTitle={tvShow.name} />
              </div>

              <div className="text-gray-800">
                <h1 className="text-4xl font-semibold mb-2">{tvShow.name}</h1>
                {tvShow.tagline && (
                  <p className="text-xl text-gray-500 mb-4 italic">
                    {tvShow.tagline}
                  </p>
                )}

                <MovieMeta
                  year={year?.toString()}
                  rating={tvShow.vote_average}
                  seasons={tvShow.number_of_seasons}
                  episodes={tvShow.number_of_episodes}
                  mediaType="tv"
                />

                <div className="flex flex-wrap gap-2 my-6">
                  {tvShow.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-1 bg-gray-100 text-gray-700 rounded-md"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  {tvShow.overview || 'Keine Beschreibung verfügbar.'}
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {tvShow.hasTrailer && trailerUrl && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Trailer
                    </button>
                  )}
                  <a
                    href={getAmazonUrl(tvShow.name || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[rgba(26,152,255,255)] text-white px-6 py-2 rounded-md hover:bg-[rgba(26,152,255,255)]/90 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Prime Video
                  </a>
                  {tvShow.streamUrl && (
                    <button
                      className="bg-[#ea384c] text-white px-6 py-2 rounded-md hover:bg-[#ea384c]/90 transition-colors flex items-center gap-2"
                      onClick={handleStreamClick}
                    >
                      <Play className="w-4 h-4" />
                      Kostenlos
                    </button>
                  )}
                  
                  {tvShow.homepage && (
                    <a
                      href={tvShow.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Offizielle Webseite
                    </a>
                  )}
                </div>

                <div className="mt-8">
                  <CastAndCrewSection 
                    director={creator}
                    cast={tvShow.cast?.filter(person => person.character)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTrailer && trailerUrl && (
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
                src={trailerUrl}
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
