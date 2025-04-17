
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
    
    // Check if the path is already a full URL
    if (backdropPath.startsWith('http')) {
      setImageSrc(backdropPath);
      return;
    }
    
    // Handle storage paths - behalte lokale Bilder, falls vorhanden
    if (backdropPath.startsWith('/storage/')) {
      try {
        const fullUrl = window.location.origin + backdropPath;
        console.log(`Using storage URL for backdrop: ${fullUrl}`);
        setImageSrc(fullUrl);
      } catch (e) {
        setImageSrc(backdropPath);
      }
      return;
    }
    
    // Für TMDB Pfade, verwenden wir immer die TMDB URL
    if (backdropPath.startsWith('/')) {
      const tmdbUrl = `https://image.tmdb.org/t/p/original${backdropPath}`;
      console.log(`Using TMDB URL for backdrop: ${tmdbUrl}`);
      setImageSrc(tmdbUrl);
      setHasError(false);
      return;
    }
    
    setImageSrc(backdropPath);
    
  }, [backdropPath]);
  
  const handleError = () => {
    console.error(`Error loading backdrop for ${title}: ${backdropPath}`);
    
    if (!hasError && backdropPath) {
      setHasError(true);
      
      // Fallback für TMDB Pfade
      if (backdropPath.startsWith('/')) {
        const tmdbUrl = `https://image.tmdb.org/t/p/w1280${backdropPath}`;
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
