
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
