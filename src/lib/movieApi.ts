
export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching trailer movies...');
  
  const savedMoviesJson = localStorage.getItem('adminMovies');
  const savedShowsJson = localStorage.getItem('adminShows');
  let trailerItems: MovieOrShow[] = [];
  
  try {
    // Process movies with trailers
    if (savedMoviesJson) {
      const savedMovies = JSON.parse(savedMoviesJson);
      const trailerMovies = savedMovies
        .filter((movie: MovieOrShow) => movie.isNewTrailer === true);
      
      trailerItems = [...trailerItems, ...trailerMovies];
      console.log(`Found ${trailerMovies.length} trailer movies`);
    } else {
      console.log('No saved movies found in localStorage');
    }
    
    // Process TV shows with trailers
    if (savedShowsJson) {
      const savedShows = JSON.parse(savedShowsJson);
      const trailerShows = savedShows
        .filter((show: MovieOrShow) => show.hasTrailer === true);
      
      trailerItems = [...trailerItems, ...trailerShows];
      console.log(`Found ${trailerShows.length} TV shows with trailers`);
    } else {
      console.log('No saved TV shows found in localStorage');
    }
    
    // Sort all trailer items by release date, OLDEST first
    trailerItems.sort((a: MovieOrShow, b: MovieOrShow) => {
      const dateA = new Date(a.release_date || a.first_air_date || '');
      const dateB = new Date(b.release_date || b.first_air_date || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`Total trailer items: ${trailerItems.length}`);
    return trailerItems;
  } catch (e) {
    console.error('Error processing trailers:', e);
    return [];
  }
};
