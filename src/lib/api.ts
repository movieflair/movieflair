
// Re-export all but explicitly handle the overlapping exports
export * from './types';
export {
  getMovieById,
  getImportedMovies,
  getFreeMovies,
  getTrailerMovies,
  getPopularMovies,
  searchMovies,
  importMovieFromTMDB,
  getRandomImportedMovie,
  getRandomMovie,
  downloadMovieImagesToServer,
  deleteAllMovies
} from './movieApi';

export {
  getTvShowDetails,
  getTvShowById,
  getCast,
  getPopularTvShows as getPopularTvShows,
  searchTvShows as searchTvShows
} from './tvShowApi';

export * from './filterApi';
// Re-export everything from analyticsApi except VisitorStat
export { 
  trackInteraction, 
  trackPageVisit, 
  getVisitorStats 
} from './analyticsApi';
export { 
  getCustomLists,
  getCustomList,
  getRandomCustomLists,
  createCustomList,
  updateCustomList,
  deleteCustomList,
  addMovieToList,
  removeMovieFromList
} from './customListApi';
export * from './apiUtils';

// Import necessary types and functions for the getSimilarMovies function
import { MovieOrShow } from './types';
import { callTMDB, getAdminMovieSettings } from './apiUtils';

// Add missing function for similar movies
export const getSimilarMovies = async (movieId: number): Promise<MovieOrShow[]> => {
  try {
    const data = await callTMDB(`/movie/${movieId}/similar`);
    const savedSettings = await getAdminMovieSettings();
    
    return data.results
      ?.filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
      ?.map((movie: any) => {
        const savedMovie = savedSettings[movie.id] || {};
        return {
          ...movie,
          media_type: 'movie',
          isFreeMovie: savedMovie.isfreemovie || false,
          streamUrl: savedMovie.streamurl || '',
          isNewTrailer: savedMovie.isnewtrailer || false,
          hasTrailer: savedMovie.hastrailer || false,
          trailerUrl: savedMovie.trailerurl || '',
        };
      }) || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};
