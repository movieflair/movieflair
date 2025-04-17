
import { useState, useEffect } from 'react';
import { getPublicImageUrl } from '@/utils/imageUtils';

interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  const initialSrc = getPublicImageUrl(backdropPath);
  const [currentSrc, setCurrentSrc] = useState<string | null>(initialSrc);
  const [hasError, setHasError] = useState(false);
  
  // Bei Änderung des backdropPath den currentSrc aktualisieren
  useEffect(() => {
    setCurrentSrc(getPublicImageUrl(backdropPath));
    setHasError(false);
  }, [backdropPath]);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && backdropPath) {
      console.log(`Fehler beim Laden des Hintergrundbilds für ${title}. Versuche Fallback...`);
      setHasError(true);
      
      // Bei TMDB-Pfaden direkte URL verwenden
      if (backdropPath.startsWith('/') && !backdropPath.startsWith('/storage')) {
        const tmdbUrl = `https://image.tmdb.org/t/p/original${backdropPath}`;
        console.log(`Verwende TMDB-Fallback: ${tmdbUrl}`);
        setCurrentSrc(tmdbUrl);
      } else if (backdropPath.startsWith('http')) {
        // Bei externen URLs ist der Fehler wahrscheinlich permanent
        setCurrentSrc(null);
      }
    } else if (hasError) {
      // Zweiter Fehler, wir geben auf
      console.error(`Alle Fallbacks für ${title} Hintergrundbild fehlgeschlagen`);
      setCurrentSrc(null);
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
