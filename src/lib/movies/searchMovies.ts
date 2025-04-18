
import { MovieOrShow } from '../types';
import { callTMDB } from '../apiUtils';
import { getAdminMovieSettings } from '../apiUtils';

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/movie', { query });
  const savedSettings = await getAdminMovieSettings();
  
  return data.results
    .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
    .map((movie: any) => {
      const savedMovie = savedSettings[movie.id] || {};
      return {
        ...movie,
        media_type: 'movie',
        isFreeMovie: savedMovie.isFreeMovie || false,
        streamUrl: savedMovie.streamUrl || '',
        isNewTrailer: savedMovie.isNewTrailer || false,
        hasTrailer: savedMovie.hasTrailer || false,
        trailerUrl: savedMovie.trailerUrl || '',
      };
    });
};
