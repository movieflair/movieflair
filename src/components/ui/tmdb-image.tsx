
import { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';
import { Skeleton } from './skeleton';

interface TMDBImageProps {
  path?: string | null;
  size?: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original';
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean; // New prop for priority loading
}

/**
 * A component for reliably loading TMDB images with proper error handling
 * - Implements retry logic for transient failures
 * - Uses local state to track loading status
 * - Provides appropriate fallbacks
 * - Supports priority loading for critical images
 */
export const TMDBImage = ({
  path,
  size = 'w500',
  alt,
  className = '',
  fallbackClassName = '',
  priority = false // Default to false for non-critical images
}: TMDBImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 2;
  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    retryCount.current = 0;

    if (!path) {
      setLoading(false);
      setError(true);
      return;
    }

    // Normalize path (remove leading slash if present)
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const imageUrl = `https://image.tmdb.org/t/p/${size}/${normalizedPath}`;
    setImgSrc(imageUrl);

    // If this is a priority image, we don't want to delay loading
    const initialDelay = priority ? 0 : 50;
    
    const loadImage = () => {
      if (!isMounted) return;
      
      const img = new Image();
      
      // For priority images, add preload hint
      if (priority) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        document.head.appendChild(link);
      }
      
      img.src = imageUrl;
      
      img.onload = () => {
        if (isMounted) {
          setLoading(false);
          setError(false);
        }
      };
      
      img.onerror = () => {
        if (!isMounted) return;
        
        console.warn(`Failed to load TMDB image: ${imageUrl}, retry: ${retryCount.current}`);
        
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          const retryDelay = Math.pow(3, retryCount.current) * 100;
          
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(loadImage, retryDelay);
        } else {
          setLoading(false);
          setError(true);
        }
      };
    };

    setTimeout(loadImage, initialDelay);

    return () => {
      isMounted = false;
    };
  }, [path, size, priority]);

  if (loading) {
    return (
      <Skeleton 
        className={`${className || 'w-full h-full'}`} 
        aria-label={`Loading ${alt}`} 
      />
    );
  }

  if (error || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className || 'w-full h-full'}`}>
        <ImageOff className="w-8 h-8 text-gray-400" aria-label={`No image available for ${alt}`} />
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      loading={priority ? 'eager' : 'lazy'} // Use eager loading for priority images
    />
  );
};
