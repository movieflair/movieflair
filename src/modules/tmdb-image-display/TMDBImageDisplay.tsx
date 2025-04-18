
import React, { useState, useEffect, useRef } from 'react';
import { TMDBImageDisplayProps } from './types';
import { tmdbImageService } from './tmdb-api';
import { ImagePlaceholder } from './ImagePlaceholder';
import { ImageSkeleton } from './ImageSkeleton';

/**
 * Standalone TMDB Image Display Component
 * Can be used independently of any website's codebase to display TMDB images
 */
export const TMDBImageDisplay: React.FC<TMDBImageDisplayProps> = ({
  path,
  size = 'w500',
  type = 'poster',
  alt,
  className = '',
  fallbackClassName = '',
  priority = false,
  apiKey,
  configUrl,
  onLoad,
  onError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isMounted = useRef(true);
  
  // Initialize the TMDB service if apiKey is provided
  useEffect(() => {
    if (apiKey) {
      tmdbImageService.initialize(apiKey, configUrl);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [apiKey, configUrl]);
  
  // Load and display the image
  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(false);
    retryCount.current = 0;

    if (!path) {
      setLoading(false);
      setError(true);
      if (onError) onError();
      return;
    }

    const loadImage = async () => {
      if (!isMounted.current) return;
      
      try {
        // Get the image URL from the service
        const imageUrl = await tmdbImageService.buildImageUrl(path, size);
        setImgSrc(imageUrl);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        
        img.onload = () => {
          if (isMounted.current) {
            setLoading(false);
            setError(false);
            if (onLoad) onLoad();
          }
        };
        
        img.onerror = async () => {
          if (!isMounted.current) return;
          
          console.warn(`Failed to load TMDB image: ${imageUrl}, retry: ${retryCount.current}`);
          
          if (retryCount.current < maxRetries) {
            retryCount.current += 1;
            const retryDelay = Math.pow(2, retryCount.current) * 300;
            
            console.log(`Retrying in ${retryDelay}ms...`);
            setTimeout(loadImage, retryDelay);
          } else {
            // Try the alternate base URL
            const alternateBaseUrl = tmdbImageService.getAlternateBaseUrl();
            const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
            const altImageUrl = `${alternateBaseUrl}${size}/${normalizedPath}`;
            
            console.log(`Last attempt with alternate CDN: ${altImageUrl}`);
            const altImg = new Image();
            altImg.crossOrigin = 'anonymous';
            altImg.src = altImageUrl;
            
            altImg.onload = () => {
              if (isMounted.current) {
                setImgSrc(altImageUrl);
                setError(false);
                setLoading(false);
                if (onLoad) onLoad();
              }
            };
            
            altImg.onerror = () => {
              if (isMounted.current) {
                setLoading(false);
                setError(true);
                if (onError) onError();
              }
            };
          }
        };
      } catch (error) {
        console.error('Error loading TMDB image:', error);
        setLoading(false);
        setError(true);
        if (onError) onError();
      }
    };

    // Preload image for priority images
    if (priority && path) {
      const preloadImage = async () => {
        try {
          const imageUrl = await tmdbImageService.buildImageUrl(path, size);
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = imageUrl;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
          
          return () => {
            if (link.parentNode) {
              document.head.removeChild(link);
            }
          };
        } catch (error) {
          console.error('Error preloading image:', error);
        }
      };
      
      preloadImage();
    }

    // Start loading the image
    const initialDelay = priority ? 0 : 50;
    setTimeout(loadImage, initialDelay);
    
    return () => {
      isMounted.current = false;
    };
  }, [path, size, priority, onLoad, onError]);

  if (loading) {
    return <ImageSkeleton className={className} alt={`Loading ${alt}`} />;
  }

  if (error || !imgSrc) {
    return <ImagePlaceholder className={fallbackClassName || className} alt={`No image available for ${alt}`} />;
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
