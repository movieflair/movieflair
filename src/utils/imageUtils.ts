
/**
 * Hilfsfunktionen für die Behandlung von Bildpfaden in der gesamten Anwendung
 */

/**
 * Konvertiert Bildpfade zu korrekt formatierten Serverpfaden
 * Behandelt:
 * - Pfade bereits im Speicherformat (/storage/...)
 * - Externe URLs (http://...)
 * - TMDB-Pfade (/abc123.jpg)
 * - Einfache Dateinamen (abc123.jpg)
 */
export const getImagePath = (path?: string, type: 'poster' | 'backdrop' = 'poster'): string | null => {
  if (!path) return null;
  
  // Wenn bereits ein Storage-Pfad, direkt verwenden
  if (path.startsWith('/storage')) {
    return path;
  }
  
  // Für externe URLs, diese verwenden, aber Warnung ausgeben
  if (path.startsWith('http')) {
    console.warn('Externe Bild-URL gefunden, sollte in lokalen Speicher importiert werden:', path);
    return path;
  }
  
  // Für TMDB-Pfade (beginnend mit Schrägstrich)
  if (path.startsWith('/')) {
    const pathWithoutSlash = path.substring(1);
    const storagePath = `/storage/movie_images/${type === 'poster' ? 'posters' : 'backdrops'}/${pathWithoutSlash}`;
    return storagePath;
  }
  
  // Standardfall: Annahme, es ist ein Dateiname in unserem Speicher
  const storagePath = `/storage/movie_images/${type === 'poster' ? 'posters' : 'backdrops'}/${path}`;
  return storagePath;
};

/**
 * Holt den korrekten Pfad für ein Filmposter
 */
export const getPosterPath = (path?: string): string | null => {
  return getImagePath(path, 'poster');
};

/**
 * Holt den korrekten Pfad für ein Filmhintergrundbild
 */
export const getBackdropPath = (path?: string): string | null => {
  return getImagePath(path, 'backdrop');
};
