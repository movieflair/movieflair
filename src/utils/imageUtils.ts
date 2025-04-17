
/**
 * Helper functions for handling image paths throughout the application
 */

/**
 * Gets the path for a movie poster from TMDB
 */
export const getPosterPath = (path?: string): string | null => {
  if (!path) return null;
  
  // For storage URLs, return as is
  if (path.startsWith('/storage')) {
    return path;
  }
  
  // For external URLs (including TMDB URLs), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Default case for TMDB paths
  return `https://image.tmdb.org/t/p/w500${path}`;
};

/**
 * Gets the path for a movie backdrop from TMDB
 */
export const getBackdropPath = (path?: string): string | null => {
  if (!path) return null;
  
  // For storage URLs, return as is
  if (path.startsWith('/storage')) {
    return path;
  }
  
  // For external URLs (including TMDB URLs), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Default case for TMDB paths
  return `https://image.tmdb.org/t/p/original${path}`;
};

/**
 * Normalizes an image path to work for UI display
 */
export const normalizeImagePath = (path?: string): string | null => {
  if (!path) return null;
  
  // If it's already a URL or storage path, use it as is
  if (path.startsWith('http') || path.startsWith('/storage')) {
    return path;
  }
  
  // Add the TMDB base URL
  return `https://image.tmdb.org/t/p/original${path}`;
};

/**
 * Checks if a URL is from the TMDB server
 */
export const isTMDBUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('image.tmdb.org');
};
