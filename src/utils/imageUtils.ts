
/**
 * Helper functions for handling image paths throughout the application
 */

/**
 * Gets the proper public URL for a path with appropriate error handling
 * This is the main function that should be used throughout the application
 */
export const getPublicImageUrl = (path?: string): string | null => {
  if (!path) return null;
  
  try {
    // For storage URLs, add origin
    if (path.startsWith('/storage')) {
      return window.location.origin + path;
    }
    
    // For external URLs (including TMDB URLs), return as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // Default case for TMDB paths
    return `https://image.tmdb.org/t/p/original${path}`;
  } catch (error) {
    console.error('Error processing image path:', error, path);
    return null;
  }
};

// Legacy functions, kept for backward compatibility
export const getPosterPath = getPublicImageUrl;
export const getBackdropPath = getPublicImageUrl;
export const normalizeImagePath = getPublicImageUrl;
export const isTMDBUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('image.tmdb.org');
};
