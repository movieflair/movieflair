
/**
 * Helper functions for handling image paths throughout the application
 */

/**
 * Gets the path for a movie poster from TMDB
 */
export const getPosterPath = (path?: string): string | null => {
  if (!path) return null;
  
  // For storage URLs, return with origin
  if (path.startsWith('/storage')) {
    return window.location.origin + path;
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
  
  // For storage URLs, return with origin
  if (path.startsWith('/storage')) {
    return window.location.origin + path;
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
  
  // If it's a storage path, add the origin
  if (path.startsWith('/storage')) {
    return window.location.origin + path;
  }
  
  // If it's already a URL, use it as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Add the TMDB base URL for relative paths
  return `https://image.tmdb.org/t/p/original${path}`;
};

/**
 * Checks if a URL is from the TMDB server
 */
export const isTMDBUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('image.tmdb.org');
};

/**
 * Gets the proper public URL for a path with appropriate error handling
 * This is a more robust function for handling image paths
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
