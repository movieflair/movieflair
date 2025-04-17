
import { useState, useEffect } from 'react';
import WatchlistButton from '@/components/movies/WatchlistButton';
import ShareButton from '@/components/movies/ShareButton';
import { getPosterPath, normalizeImagePath } from '@/utils/imageUtils';

interface MoviePosterProps {
  id: number;
  title: string;
  posterPath?: string;
}

const MoviePoster = ({ id, title, posterPath }: MoviePosterProps) => {
  const imageSrc = getPosterPath(posterPath);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(imageSrc);
  
  // Bei Änderung des posterPath den currentSrc aktualisieren
  useEffect(() => {
    setCurrentSrc(getPosterPath(posterPath));
    setHasError(false);
  }, [posterPath]);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Bei einem Fehler versuchen wir einen Fallback
    if (!hasError && posterPath) {
      console.log(`Fehler beim Laden des Posters für ${title}. Versuche Fallback...`);
      setHasError(true);
      
      // Wenn der Pfad mit / beginnt, aber nicht mit /storage,
      // handelt es sich um einen TMDB-Pfad
      if (posterPath.startsWith('/') && !posterPath.startsWith('/storage')) {
        const tmdbUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
        console.log(`Verwende TMDB-Fallback: ${tmdbUrl}`);
        setCurrentSrc(tmdbUrl);
      } 
      // Wenn es eine Storage-URL ist, die fehlschlägt, versuchen wir es mit der TMDB-ID
      else if (posterPath.includes('movie_images') && id) {
        // Versuchen wir den Film über TMDB direkt zu holen
        const tmdbFallback = `https://image.tmdb.org/t/p/w500/TMDB_FALLBACK_${id}`;
        console.log(`Verwende TMDB-ID-Fallback: ${tmdbFallback}`);
        setCurrentSrc(tmdbFallback);
      } else if (posterPath.startsWith('http')) {
        // Bei externen URLs nichts tun, da der Fehler wahrscheinlich permanent ist
        console.error(`Externer URL-Fehler für ${posterPath}`);
        setCurrentSrc(null);
      }
    } else if (hasError) {
      // Zweiter Fehler, wir geben auf
      console.error(`Alle Fallbacks für ${title} fehlgeschlagen`);
      setCurrentSrc(null);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="relative mb-2">
        <div className="rounded-lg overflow-hidden shadow-xl">
          {currentSrc ? (
            <img
              src={currentSrc}
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
