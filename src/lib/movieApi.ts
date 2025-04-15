import { MovieOrShow, MovieDetail } from './types';
import { callTMDB, getAdminMovieSettings } from './apiUtils';

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
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
  const data = await callTMDB('/movie/now_playing');
  const savedSettings = await getAdminMovieSettings();
  
  const movies = data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
  
  return movies.filter(movie => movie.isNewTrailer === true);
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  const savedSettings = await getAdminMovieSettings();
  
  const movies = data.results.map((movie: any) => {
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
  
  return movies.filter(movie => movie.isFreeMovie === true);
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
