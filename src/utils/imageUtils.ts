
/**
 * Utility functions for handling image paths throughout the application
 */

/**
 * Converts any image path to a properly formatted server storage path
 * Handles:
 * - Paths already in storage format (/storage/...)
 * - External URLs (http://...)
 * - TMDB paths (/abc123.jpg)
 * - Plain filenames (abc123.jpg)
 */
export const getImagePath = (path?: string, type: 'poster' | 'backdrop' = 'poster'): string | null => {
  if (!path) return null;
  
  // If already a storage path, use it directly
  if (path.startsWith('/storage')) {
    return path;
  }
  
  // For external URLs, log warning but use them during transition
  if (path.startsWith('http')) {
    console.warn('External image URL found, should be imported to local storage:', path);
    return path;
  }
  
  // For TMDB paths (starting with slash)
  if (path.startsWith('/')) {
    const pathWithoutSlash = path.replace(/^\//, '');
    return `/storage/movie_images/${type === 'poster' ? 'posters' : 'backdrops'}/${pathWithoutSlash}`;
  }
  
  // Default case: assume it's a filename in our storage
  return `/storage/movie_images/${type === 'poster' ? 'posters' : 'backdrops'}/${path}`;
};

/**
 * Get the correct poster image path
 */
export const getPosterPath = (path?: string): string | null => {
  return getImagePath(path, 'poster');
};

/**
 * Get the correct backdrop image path
 */
export const getBackdropPath = (path?: string): string | null => {
  return getImagePath(path, 'backdrop');
};
