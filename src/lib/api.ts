
// Re-export all but explicitly handle the overlapping exports
export * from './types';
export {
  getMovieById,
  getFreeMovies,
  getTrailerMovies,
  getPopularMovies,
  searchMovies,
  getRandomMovie,
  getSimilarMovies,
  getImportedMovies,
  deleteAllMovies
} from './movieApi';

export {
  getTvShowDetails,
  getTvShowById,
  getCast,
  getPopularTvShows,
  searchTvShows
} from './tvShowApi';

export * from './filterApi';
// Re-export everything from analyticsApi except VisitorStat
export { 
  trackInteraction, 
  trackPageVisit
} from './analyticsApi';
export { 
  getCustomLists,
  getCustomList,
  getRandomCustomLists,
  cleanAllCustomLists
} from './customListApi';
export * from './apiUtils';

// Export the download and import functions from the new files
export { downloadMovieImagesToServer } from './api/imageUtils';
export { importMovieFromTMDB } from './api/movieImporter';
export { getRandomImportedMovie } from './api/randomMovieApi';

// Export the new CMS API functions
export {
  fetchMovieFromTMDB,
  searchTMDBMovies,
  getPopularTMDBMovies,
  importMovieFromTMDB as importMovieFromTMDBAdmin,
  getAllMovies,
  getMovieById as getAdminMovieById,
  updateMovie,
  deleteMovie,
  downloadImageToStorage,
  uploadMovieImage,
  ensureMovieImagesBucketExists
} from './cms';
