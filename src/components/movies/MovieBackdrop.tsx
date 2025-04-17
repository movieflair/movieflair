
import { getBackdropPath } from '@/utils/imageUtils';
import { useState } from 'react';

interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  const imageSrc = getBackdropPath(backdropPath);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Fehler beim Laden des Hintergrundbilds für ${title}:`, e);
    
    // Try using the TMDB fallback if it's a TMDB path and we're not already using the fallback
    if (!hasError && backdropPath && backdropPath.startsWith('/') && !backdropPath.startsWith('/storage')) {
      console.log('Trying TMDB fallback for backdrop');
      setHasError(true);
      setCurrentSrc(`https://image.tmdb.org/t/p/original${backdropPath}`);
    }
  };
  
  return (
    <div className="relative h-[400px] overflow-hidden">
      {currentSrc ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
          <img
            src={currentSrc}
            alt={title}
            className="w-full h-full object-cover"
            onError={handleError}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
    </div>
  );
};

export default MovieBackdrop;
