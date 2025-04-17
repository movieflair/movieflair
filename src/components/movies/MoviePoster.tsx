
import { useState } from 'react';
import WatchlistButton from '@/components/movies/WatchlistButton';
import ShareButton from '@/components/movies/ShareButton';
import { getPosterPath } from '@/utils/imageUtils';

interface MoviePosterProps {
  id: number;
  title: string;
  posterPath?: string;
}

const MoviePoster = ({ id, title, posterPath }: MoviePosterProps) => {
  const imageSrc = getPosterPath(posterPath);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Fehler beim Laden des Posters für ${title}:`, e);
    
    // Versuche zuerst eine lokale URL
    if (!hasError && posterPath) {
      setHasError(true);
      
      // Wenn es ein TMDB-Pfad ist, versuche die TMDB-URL
      if (posterPath.startsWith('/') && !posterPath.startsWith('/storage')) {
        console.log('Versuche TMDB-Fallback für Poster');
        setCurrentSrc(`https://image.tmdb.org/t/p/w500${posterPath}`);
      }
      // Wenn es eine lokale URL ist, die fehlschlägt, versuche die TMDB-ID zu extrahieren
      else if (posterPath.includes('movie_images') && id) {
        console.log('Lokales Bild fehlgeschlagen, versuche TMDB');
        setCurrentSrc(`https://image.tmdb.org/t/p/w500/TMDB_FALLBACK_${id}`);
      }
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
