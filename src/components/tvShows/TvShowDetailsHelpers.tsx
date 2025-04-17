
import { MovieDetail } from "@/lib/types";

export const getTrailerUrl = (show: MovieDetail) => {
  if (show?.trailerUrl) {
    return show.trailerUrl;
  }
  
  if (show?.videos?.results?.length > 0) {
    const firstTrailer = show.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (firstTrailer) {
      return `https://www.youtube.com/embed/${firstTrailer.key}`;
    }
  }
  
  if (show?.streamUrl) {
    return show.streamUrl;
  }
  
  return null;
};

export const truncateOverview = (text: string, maxLength: number = 500) => {
  return text.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;
};

export const getImageUrl = (path: string | undefined) => {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('/storage')) return path;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/original${path}`;
};

export const formatReleaseYear = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).getFullYear().toString();
};

export const formatReleaseDate = (date: string | undefined) => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
