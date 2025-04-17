
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
    
    // Check if the path is already a full URL
    if (posterPath.startsWith('http')) {
      setImageSrc(posterPath);
      return;
    }
    
    // Handle storage paths - behalte lokale Bilder, falls vorhanden
    if (posterPath.startsWith('/storage/')) {
      try {
        const fullUrl = window.location.origin + posterPath;
        console.log(`Using storage URL for poster: ${fullUrl}`);
        setImageSrc(fullUrl);
      } catch (e) {
        setImageSrc(posterPath);
      }
      return;
    }
    
    // Für TMDB Pfade, verwenden wir immer die TMDB URL
    if (posterPath.startsWith('/')) {
      const tmdbUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
      console.log(`Using TMDB URL for poster: ${tmdbUrl}`);
      setImageSrc(tmdbUrl);
      setHasError(false);
      return;
    }
    
    setImageSrc(posterPath);
    
  }, [posterPath]);
  
  const handleError = () => {
    console.error(`Error loading poster for ${title}: ${posterPath}`);
    
    if (!hasError && posterPath) {
      setHasError(true);
      
      // Fallback für TMDB Pfade auf ein kleineres Format
      if (posterPath.startsWith('/')) {
        const tmdbUrl = `https://image.tmdb.org/t/p/w342${posterPath}`;
        console.log(`Trying smaller TMDB image: ${tmdbUrl}`);
        setImageSrc(tmdbUrl);
      } else {
        setImageSrc(null);
      }
    } else {
      // Second error, give up
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
              loading="eager"
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
