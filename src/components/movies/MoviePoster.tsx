
import { useState, useEffect } from 'react';
import WatchlistButton from '@/components/movies/WatchlistButton';
import ShareButton from '@/components/movies/ShareButton';

interface MoviePosterProps {
  id: number;
  title: string;
  posterPath?: string;
}

const MoviePoster = ({ id, title, posterPath }: MoviePosterProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (!posterPath) {
      setImageSrc(null);
      return;
    }
    
    // Direkte URL-Konstruktion basierend auf Pfadtyp
    if (posterPath.startsWith('/storage/')) {
      // Vollständige URL für Storage-Pfade
      const fullUrl = window.location.origin + posterPath;
      setImageSrc(fullUrl);
    } else if (posterPath.startsWith('http')) {
      // Externe URLs direkt verwenden
      setImageSrc(posterPath);
    } else if (posterPath.startsWith('/')) {
      // TMDB-Pfade
      setImageSrc(`https://image.tmdb.org/t/p/w500${posterPath}`);
    } else {
      // Fallback für ungültige Pfade
      setImageSrc(null);
    }
    
    setHasError(false);
  }, [posterPath]);
  
  const handleError = () => {
    console.error(`Fehler beim Laden des Posters für ${title}: ${posterPath}`);
    
    if (!hasError && posterPath) {
      setHasError(true);
      
      // Fallback zu TMDB versuchen, wenn es ein Storage-Pfad war
      if (posterPath.startsWith('/storage/')) {
        const movieId = posterPath.split('/').pop()?.split('.')[0];
        if (movieId) {
          console.log(`Versuche TMDB-Fallback für ID: ${movieId}`);
          setImageSrc(`https://image.tmdb.org/t/p/w500/tmdb-fallback-${movieId}`);
        } else {
          setImageSrc(null);
        }
      } else {
        setImageSrc(null);
      }
    } else {
      // Zweiter Fehler, geben wir auf
      setImageSrc(null);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="relative mb-2">
        <div className="rounded-lg overflow-hidden shadow-xl">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className="w-full"
              onError={handleError}
            />
          ) : (
            <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Kein Poster</span>
            </div>
          )}
        </div>
      </div>
      <WatchlistButton mediaId={id} mediaType="movie" />
      <ShareButton movieTitle={title} />
    </div>
  );
};

export default MoviePoster;
