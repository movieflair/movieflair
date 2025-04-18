
import { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';
import { Skeleton } from './skeleton';

interface TMDBImageProps {
  path?: string | null;
  size?: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original';
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean; // For priority loading
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
  priority = false
}: TMDBImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3; // Max number of retries for failed images
  
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
    
    // Use the image base domain that's stable and works with CORS
    const imageUrl = `https://image.tmdb.org/t/p/${size}/${normalizedPath}`;
    setImgSrc(imageUrl);

    // For priority images, proactively hint to the browser
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      link.crossOrigin = 'anonymous'; // Add CORS support
      document.head.appendChild(link);
      
      // Clean up preload hint when component unmounts
      return () => {
        if (link.parentNode) {
          document.head.removeChild(link);
        }
        isMounted = false;
      };
    }
    
    const loadImage = () => {
      if (!isMounted) return;
      
      const img = new Image();
      
      // Set crossOrigin to help with CORS issues
      img.crossOrigin = 'anonymous';
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
          // Increased backoff delay to give more time for recovery
          const retryDelay = Math.pow(2, retryCount.current) * 300;
          
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(loadImage, retryDelay);
        } else {
          setLoading(false);
          setError(true);
          
          // Try a different TMDB CDN as last resort
          if (imageUrl.includes('image.tmdb.org')) {
            const altImageUrl = imageUrl.replace('image.tmdb.org', 'img.tmdb.org');
            console.log(`Last attempt with alternate CDN: ${altImageUrl}`);
            
            const altImg = new Image();
            altImg.crossOrigin = 'anonymous';
            altImg.src = altImageUrl;
            
            altImg.onload = () => {
              if (isMounted) {
                setImgSrc(altImageUrl);
                setError(false);
              }
            };
          }
        }
      };
    };

    // Immediate loading for priority images, slight delay for non-priority
    const initialDelay = priority ? 0 : 50;
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
      loading={priority ? 'eager' : 'lazy'}
      crossOrigin="anonymous"
      decoding={priority ? 'sync' : 'async'}
    />
  );
};
