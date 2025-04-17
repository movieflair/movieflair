
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
  downloadMovieImagesToServer
} from './api/imageUtils';

export {
  importMovieFromTMDB
} from './api/movieImporter';

export {
  getRandomImportedMovie
} from './api/randomMovieApi';

export {
  getFreeMovies,
  getTrailerMovies,
  getImportedMovies
} from './api/trailerMovieApi';
