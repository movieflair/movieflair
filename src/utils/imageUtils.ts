
/**
 * Helper functions for handling image paths throughout the application
 */

/**
 * Gets the path for a movie poster from TMDB
 */
export const getPosterPath = (path?: string): string | null => {
  if (!path) return null;
  
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
  
  // For external URLs (including TMDB URLs), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Default case for TMDB paths
  return `https://image.tmdb.org/t/p/original${path}`;
};
