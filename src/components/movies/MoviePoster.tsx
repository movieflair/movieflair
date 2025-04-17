
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
    
    // Versuche es mit dem TMDB-Fallback, wenn es ein TMDB-Pfad ist und wir noch nicht den Fallback verwenden
    if (!hasError && posterPath && posterPath.startsWith('/') && !posterPath.startsWith('/storage')) {
      console.log('Versuche TMDB-Fallback für Poster');
      setHasError(true);
      setCurrentSrc(`https://image.tmdb.org/t/p/w500${posterPath}`);
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
