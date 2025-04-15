
/**
 * Utility functions for generating SEO content
 */

// Default SEO values
export const DEFAULT_SEO = {
  title: 'ScreenPick - Dein Filmguide',
  description: 'Entdecke den perfekten Film für jeden Moment. Lass dich von deiner Stimmung leiten.',
  keywords: 'filme, serien, streaming, filmempfehlungen, filmtipps',
  ogImage: '/movieflair-logo.png',
};

// Generate movie structured data for Schema.org
export const generateMovieSchema = (movie: any) => {
  if (!movie) return null;
  
  const director = movie.crew?.find((person: any) => person.job === 'Director');
  
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview,
    "image": movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    "datePublished": movie.release_date,
    "aggregateRating": movie.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average,
      "ratingCount": movie.vote_count,
      "bestRating": "10",
      "worstRating": "0"
    } : undefined,
    "director": director ? {
      "@type": "Person",
      "name": director.name
    } : undefined,
    "actor": movie.cast?.slice(0, 5).map((actor: any) => ({
      "@type": "Person",
      "name": actor.name
    })),
    "genre": movie.genres?.map((genre: any) => genre.name),
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined
  };
};

// Generate TV Show structured data for Schema.org
export const generateTVShowSchema = (tvShow: any) => {
  if (!tvShow) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": tvShow.name,
    "description": tvShow.overview,
    "image": tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : undefined,
    "datePublished": tvShow.first_air_date,
    "aggregateRating": tvShow.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": tvShow.vote_average,
      "ratingCount": tvShow.vote_count,
      "bestRating": "10",
      "worstRating": "0"
    } : undefined,
    "actor": tvShow.cast?.slice(0, 5).map((actor: any) => ({
      "@type": "Person",
      "name": actor.name
    })),
    "genre": tvShow.genres?.map((genre: any) => genre.name),
    "numberOfSeasons": tvShow.number_of_seasons,
    "numberOfEpisodes": tvShow.number_of_episodes
  };
};

// Generate Organization structured data for Schema.org (for About page)
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ScreenPick",
    "url": "https://screenspick.com",
    "logo": "https://screenspick.com/movieflair-logo.png",
    "sameAs": [
      "https://facebook.com/screenspick",
      "https://twitter.com/screenspick",
      "https://instagram.com/screenspick"
    ]
  };
};

// Generate breadcrumb structured data
export const generateBreadcrumbSchema = (items: {name: string, url: string}[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};
