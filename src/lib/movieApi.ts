
import { MovieOrShow, MovieDetail } from './types';
import { callTMDB, getAdminMovieSettings } from './apiUtils';

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  const savedSettings = await getAdminMovieSettings();
  
  console.log('Retrieved admin movie settings:', Object.keys(savedSettings).length);
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
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
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching trailer movies...');
  
  const savedMoviesJson = localStorage.getItem('adminMovies');
  let trailerMovies: MovieOrShow[] = [];
  
  if (!savedMoviesJson) {
    console.log('No saved movies found in localStorage');
    return trailerMovies;
  }
  
  try {
    const savedMovies = JSON.parse(savedMoviesJson);
    console.log(`Found ${savedMovies.length} total saved movies`);
    
    // Filter for movies marked as trailers and sort by newest first
    trailerMovies = savedMovies
      .filter((movie: MovieOrShow) => movie.isNewTrailer === true)
      .sort((a: MovieOrShow, b: MovieOrShow) => {
        const dateA = new Date(a.release_date || a.first_air_date || '');
        const dateB = new Date(b.release_date || b.first_air_date || '');
        return dateB.getTime() - dateA.getTime();
      });
    
    console.log(`Filtered ${trailerMovies.length} trailer movies`);
    return trailerMovies;
  } catch (e) {
    console.error('Error parsing saved movies:', e);
    return [];
  }
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching free movies...');
  
  const savedMoviesJson = localStorage.getItem('adminMovies');
  let freeMovies: MovieOrShow[] = [];
  
  if (!savedMoviesJson) {
    console.log('No saved movies found in localStorage');
    return freeMovies;
  }
  
  try {
    const savedMovies = JSON.parse(savedMoviesJson);
    console.log(`Found ${savedMovies.length} total saved movies`);
    
    // Filter for movies marked as free and sort by newest first
    freeMovies = savedMovies
      .filter((movie: MovieOrShow) => movie.isFreeMovie === true)
      .sort((a: MovieOrShow, b: MovieOrShow) => {
        const dateA = new Date(a.release_date || a.first_air_date || '');
        const dateB = new Date(b.release_date || b.first_air_date || '');
        return dateB.getTime() - dateA.getTime();
      });
    
    console.log(`Filtered ${freeMovies.length} free movies`);
    return freeMovies;
  } catch (e) {
    console.error('Error parsing saved movies:', e);
    return [];
  }
};

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`, { append_to_response: 'videos' }),
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
    hasStream: savedMovie.hasStream || false,
    streamUrl: savedMovie.streamUrl || '',
    isFreeMovie: savedMovie.isFreeMovie || false,
    isNewTrailer: savedMovie.isNewTrailer || false,
    trailerUrl: savedMovie.trailerUrl || '',
  };
};

export const getSimilarMovies = async (movieId: number): Promise<MovieOrShow[]> => {
  const data = await callTMDB(`/movie/${movieId}/similar`);
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const getRandomMovie = async (): Promise<MovieOrShow> => {
  const movies = await getPopularMovies();
  const randomIndex = Math.floor(Math.random() * movies.length);
  return movies[randomIndex];
};
