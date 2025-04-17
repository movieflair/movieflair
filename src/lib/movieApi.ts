
// Re-export all functions from the new API files
export { 
  getMovieById,
  getPopularMovies,
  searchMovies,
  getPopularTvShows,
  searchTvShows,
  getSimilarMovies,
  getRandomMovie
} from './api/basicMovieApi';

export {
  mapSupabaseMovieToMovieObject,
  deleteAllMovies
} from './api/movieUtils';

export {
  downloadMovieImagesToServer,
  importMovieFromTMDB,
  getRandomImportedMovie
} from './api/movieImportApi';

export {
  getFreeMovies,
  getTrailerMovies,
  getImportedMovies
} from './api/trailerMovieApi';
