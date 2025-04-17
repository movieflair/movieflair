
import { useState, useEffect } from 'react';
import { getPublicImageUrl } from '@/utils/imageUtils';

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
    
    // Use our centralized image URL utility
    const url = getPublicImageUrl(backdropPath);
    setImageSrc(url);
    setHasError(false);
    
  }, [backdropPath]);
  
  const handleError = () => {
    console.error(`Error loading backdrop for ${title}: ${backdropPath}`);
    
    if (!hasError && backdropPath) {
      setHasError(true);
      
      // Attempt one more fallback for storage paths
      if (backdropPath.startsWith('/storage/')) {
        try {
          // Try with a forced full URL
          const fullUrl = window.location.origin + backdropPath;
          console.log(`Trying alternative storage URL: ${fullUrl}`);
          setImageSrc(fullUrl);
        } catch (e) {
          setImageSrc(null);
        }
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
