
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface TMDBImageProps {
  path?: string | null;
  size?: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original';
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * A component for reliably loading TMDB images with proper error handling
 */
export const TMDBImage = ({
  path,
  size = 'w500',
  alt,
  className = '',
  fallbackClassName = ''
}: TMDBImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when path changes
    setLoading(true);
    setError(false);

    if (!path) {
      setLoading(false);
      setError(true);
      return;
    }

    // Normalize path (remove leading slash if present)
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const imageUrl = `https://image.tmdb.org/t/p/${size}/${normalizedPath}`;
    
    // Preload the image
    const img = new Image();
    img.src = imageUrl;
    setImgSrc(imageUrl);
    
    img.onload = () => {
      setLoading(false);
    };
    
    img.onerror = () => {
      console.error(`Failed to load TMDB image: ${imageUrl}`);
      setLoading(false);
      setError(true);
    };

    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [path, size]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className || 'w-full h-full'}`} aria-label={`Loading ${alt}`} />
    );
  }

  if (error || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className || 'w-full h-full'}`}>
        <ImageOff className="w-8 h-8 text-gray-400" aria-label={`No image available for ${alt}`} />
      </div>
    );
  }

  return <img src={imgSrc} alt={alt} className={className} />;
};
