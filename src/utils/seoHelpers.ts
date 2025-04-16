
/**
 * Helper functions for SEO metadata across the site
 */

// Truncate text to a specified length and add ellipsis if needed
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

// Default SEO values for the application
export const DEFAULT_SEO = {
  siteName: 'MovieFlair',
  title: 'MovieFlair – Finde den perfekten Film für deine Stimmung',
  description: 'Jeder Moment hat seinen Film. MovieFlair zeigt dir Filme, die zu deiner Stimmung passen – persönlich, emotional und genau im richtigen Moment.',
  keywords: 'filme, serien, streaming, filmempfehlungen, filmtipps',
  ogImage: '/movieflair-logo.png',
  defaultPostfix: ' | MovieFlair'
};

/**
 * Format movie or show title
 * Format: "[Title] (Year) Online Stream anschauen | MovieFlair"
 */
export const formatMediaTitle = (title: string, year?: string): string => {
  if (!title) return DEFAULT_SEO.title;
  
  const yearPart = year ? ` (${year})` : '';
  return `${title}${yearPart} Online Stream anschauen${DEFAULT_SEO.defaultPostfix}`;
};

/**
 * Format media description
 * Format: "Jetzt [Title] (Year) Online Stream anschauen - [Description]"
 * Limited to 140 characters
 */
export const formatMediaDescription = (title: string, year: string, description: string, maxLength: number = 160): string => {
  if (!title) return DEFAULT_SEO.description;
  
  const yearPart = year ? ` (${year})` : '';
  const baseDesc = `Jetzt ${title}${yearPart} Online Stream anschauen - ${description || 'Entdecke diesen Film auf MovieFlair.'}`;
  return truncateText(baseDesc, maxLength);
};

/**
 * Format list title
 * Format: "[List Title] Online anschauen | MovieFlair"
 */
export const formatListTitle = (title: string): string => {
  if (!title) return DEFAULT_SEO.title;
  return `${title} Online anschauen${DEFAULT_SEO.defaultPostfix}`;
};

/**
 * Format list description
 * Format: "[List Title] Online anschauen - [List Description]"
 * Limited to 140 characters
 */
export const formatListDescription = (title: string, description: string, maxLength: number = 160): string => {
  if (!title) return DEFAULT_SEO.description;
  const baseDesc = `${title} Online anschauen - ${description || 'Entdecke diese Filmauswahl auf MovieFlair.'}`;
  return truncateText(baseDesc, maxLength);
};

/**
 * Get absolute URL for SEO images
 */
export const getAbsoluteImageUrl = (imagePath: string): string => {
  if (!imagePath) return DEFAULT_SEO.ogImage;
  
  if (imagePath.startsWith('http')) return imagePath;
  
  // Ensure we always have a fallback for server-side rendering
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://movieflair.lovable.app';
  
  return imagePath.startsWith('/') 
    ? `${origin}${imagePath}`
    : `${origin}/${imagePath}`;
};

/**
 * Create canonical URL
 */
export const createCanonicalUrl = (path: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://movieflair.lovable.app';
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Generate structured data for a movie
 */
export const generateMovieStructuredData = (movie: any, director?: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    'name': movie.title,
    'description': movie.overview,
    'image': movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    'datePublished': movie.release_date,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': String(movie.vote_average),
      'ratingCount': String(movie.vote_count || 0),
      'bestRating': '10',
      'worstRating': '0'
    },
    'director': director ? {
      '@type': 'Person',
      'name': director.name
    } : undefined,
    'actor': movie.cast?.slice(0, 5).map((actor: any) => ({
      '@type': 'Person',
      'name': actor.name
    })),
    'genre': movie.genres?.map((genre: any) => genre.name),
    'duration': movie.runtime ? `PT${String(movie.runtime)}M` : undefined
  };
};

/**
 * Generate structured data for a TV show
 */
export const generateTvShowStructuredData = (show: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    'name': show.name,
    'description': show.overview,
    'image': show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
    'datePublished': show.first_air_date,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': String(show.vote_average),
      'ratingCount': String(show.vote_count || 0),
      'bestRating': '10',
      'worstRating': '0'
    },
    'actor': show.cast?.slice(0, 5).map((actor: any) => ({
      '@type': 'Person',
      'name': actor.name
    })),
    'genre': show.genres?.map((genre: any) => genre.name),
    'numberOfEpisodes': show.number_of_episodes,
    'numberOfSeasons': show.number_of_seasons
  };
};
