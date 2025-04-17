
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
 * Normalisiert einen Bildpfad, um für die UI-Anzeige zu funktionieren
 */
export const normalizeImagePath = (path?: string): string | null => {
  if (!path) return null;
  
  // Wenn es bereits eine URL ist, verwende sie
  if (path.startsWith('http') || path.startsWith('/storage')) {
    return path;
  }
  
  // Füge die TMDB-Basis-URL hinzu
  return `https://image.tmdb.org/t/p/original${path}`;
};

/**
 * Prüft, ob eine URL vom TMDB-Server stammt
 */
export const isTMDBUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('image.tmdb.org');
};
