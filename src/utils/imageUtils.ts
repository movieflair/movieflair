
/**
 * Helper functions for handling image paths throughout the application
 */

/**
 * Converts image paths to correctly formatted server paths
 * Handles:
 * - Paths already in storage format (/storage/...)
 * - External URLs (http://...)
 * - TMDB paths (/abc123.jpg)
 * - Simple filenames (abc123.jpg)
 */
export const getImagePath = (path?: string, type: 'poster' | 'backdrop' = 'poster'): string | null => {
  if (!path) return null;
  
  // If already a storage path, use directly
  if (path.startsWith('/storage')) {
    return path;
  }
  
  // For external URLs (including TMDB URLs), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // For TMDB paths (starting with slash)
  if (path.startsWith('/')) {
    // Use our server storage path instead
    return `/storage/movie_images/${type === 'poster' ? 'posters' : 'backdrops'}/${path.substring(1)}`;
  }
  
  // Default case: assume it's a filename in our storage
  return `/storage/movie_images/${type === 'poster' ? 'posters' : 'backdrops'}/${path}`;
};

/**
 * Gets the correct path for a movie poster
 */
export const getPosterPath = (path?: string): string | null => {
  return getImagePath(path, 'poster');
};

/**
 * Gets the correct path for a movie backdrop
 */
export const getBackdropPath = (path?: string): string | null => {
  return getImagePath(path, 'backdrop');
};
