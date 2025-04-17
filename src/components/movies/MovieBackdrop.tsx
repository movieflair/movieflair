
import { useState, useEffect } from 'react';

interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (!backdropPath) {
      setImageSrc(null);
      return;
    }
    
    // Direkte URL-Konstruktion basierend auf Pfadtyp
    if (backdropPath.startsWith('/storage/')) {
      // Vollständige URL für Storage-Pfade
      const fullUrl = window.location.origin + backdropPath;
      setImageSrc(fullUrl);
    } else if (backdropPath.startsWith('http')) {
      // Externe URLs direkt verwenden
      setImageSrc(backdropPath);
    } else if (backdropPath.startsWith('/')) {
      // TMDB-Pfade
      setImageSrc(`https://image.tmdb.org/t/p/original${backdropPath}`);
    } else {
      // Fallback für ungültige Pfade
      setImageSrc(null);
    }
    
    setHasError(false);
  }, [backdropPath]);
  
  const handleError = () => {
    console.error(`Fehler beim Laden des Hintergrundbilds für ${title}: ${backdropPath}`);
    
    if (!hasError && backdropPath) {
      setHasError(true);
      
      // Fallback zu TMDB versuchen, wenn es ein Storage-Pfad war
      if (backdropPath.startsWith('/storage/')) {
        const movieId = backdropPath.split('/').pop()?.split('.')[0];
        if (movieId) {
          console.log(`Versuche TMDB-Fallback für ID: ${movieId}`);
          setImageSrc(`https://image.tmdb.org/t/p/original/tmdb-fallback-${movieId}`);
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
    <div className="relative h-[400px] overflow-hidden">
      {imageSrc ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
          <img
            src={imageSrc}
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
