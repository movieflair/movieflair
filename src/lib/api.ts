
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
  deleteAllMovies,
  getSimilarMovies
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
