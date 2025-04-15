
import { MovieOrShow, MovieDetail } from './types';
import { getAdminMovieSettings, getAdminTvShowSettings } from './apiUtils';
import { callTMDB } from './apiUtils';

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

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching free movies...');
  
  const savedMoviesJson = localStorage.getItem('adminMovies');
  let freeMovies: MovieOrShow[] = [];
  
  try {
    if (savedMoviesJson) {
      const savedMovies = JSON.parse(savedMoviesJson);
      freeMovies = savedMovies
        .filter((movie: MovieOrShow) => movie.isFreeMovie === true);
      
      // Sort by release date, newest first
      freeMovies.sort((a: MovieOrShow, b: MovieOrShow) => {
        const dateA = new Date(a.release_date || a.first_air_date || '');
        const dateB = new Date(b.release_date || b.first_air_date || '');
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Found ${freeMovies.length} free movies`);
    } else {
      console.log('No saved movies found in localStorage');
    }
    
    return freeMovies;
  } catch (e) {
    console.error('Error processing free movies:', e);
    return [];
  }
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
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

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/movie', { query });
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
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

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  const savedSettings = await getAdminMovieSettings();
  const savedMovie = savedSettings[id] || {};

  return {
    ...movieData,
    media_type: 'movie',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: savedMovie.hasTrailer ?? videos.results?.some((v: any) => v.type === 'Trailer'),
    hasStream: savedMovie.isFreeMovie || false,
    streamUrl: savedMovie.streamUrl || '',
    trailerUrl: savedMovie.trailerUrl || '',
    isFreeMovie: savedMovie.isFreeMovie || false,
    isNewTrailer: savedMovie.isNewTrailer || false,
  };
};

export const getSimilarMovies = async (id: number): Promise<MovieOrShow[]> => {
  const data = await callTMDB(`/movie/${id}/similar`);
  return data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie'
  }));
};

export const getRandomMovie = async (): Promise<MovieDetail> => {
  // Get a list of popular movies
  const popularMovies = await getPopularMovies();
  
  // Randomly select one
  const randomIndex = Math.floor(Math.random() * popularMovies.length);
  const randomMovie = popularMovies[randomIndex];
  
  // Fetch its full details
  return getMovieById(randomMovie.id);
};
