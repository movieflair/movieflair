
import { MovieDetail } from "@/lib/types";

export const getTrailerUrl = (movie: MovieDetail) => {
  if (movie?.trailerUrl) {
    return movie.trailerUrl;
  }
  
  if (movie?.videos?.results?.length > 0) {
    const firstTrailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (firstTrailer) {
      return `https://www.youtube.com/embed/${firstTrailer.key}`;
    }
  }
  
  if (movie?.streamUrl) {
    return movie.streamUrl;
  }
  
  return null;
};

export const truncateOverview = (text: string, maxLength: number = 500) => {
  return text.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;
};
