
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
      
      // Sort by release date, OLDEST first (same as trailers page)
      freeMovies.sort((a: MovieOrShow, b: MovieOrShow) => {
        const dateA = new Date(a.release_date || a.first_air_date || '');
        const dateB = new Date(b.release_date || b.first_air_date || '');
        return dateA.getTime() - dateB.getTime();
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
  return data.results
    .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
    .map((movie: any) => ({
      ...movie,
      media_type: 'movie'
    }));
};

export const getRandomMovie = async (): Promise<MovieDetail> => {
  console.log('Getting random movie with improved decade selection...');
  
  // Definiere alle möglichen Jahrzehnte
  const allDecades = ['1970', '1980', '1990', '2000', '2010', '2020'];
  
  // Wähle zufällig ein Jahrzehnt
  const randomDecade = allDecades[Math.floor(Math.random() * allDecades.length)];
  console.log(`Selected random decade: ${randomDecade}`);
  
  try {
    // Grundlegende Parameter für die API-Anfrage
    let params: Record<string, any> = {
      'sort_by': 'popularity.desc',
      'vote_count.gte': '5',
      'include_adult': 'false',
      'include_video': 'false',
      'page': '1',
    };
    
    // Setze den Jahrzehnt-Filter
    const decade = parseInt(randomDecade);
    if (!isNaN(decade)) {
      const startYear = decade;
      const endYear = decade + 9;
      
      params = {
        ...params,
        'primary_release_date.gte': `${startYear}-01-01`,
        'primary_release_date.lte': `${endYear}-12-31`
      };
      
      console.log(`Searching for movies between ${startYear}-${endYear}`);
    }
    
    // API-Aufruf für das ausgewählte Jahrzehnt
    const data = await callTMDB('/discover/movie', params);
    
    if (!data.results || data.results.length === 0) {
      console.log('No results found, trying with fewer restrictions');
      
      // Fallback mit weniger Einschränkungen für ältere Filme
      params.vote_count_gte = '3';
      const fallbackData = await callTMDB('/discover/movie', params);
      
      if (!fallbackData.results || fallbackData.results.length === 0) {
        throw new Error('No movies found for the selected decade');
      }
      
      // Filter valid results
      const validResults = fallbackData.results
        .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
      
      if (validResults.length === 0) {
        throw new Error('No valid movies found for the selected decade');
      }
      
      // Randomly select one movie from valid results
      const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
      return getMovieById(randomMovie.id);
    }
    
    // Filter valid results from initial search
    const validResults = data.results
      .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
    
    if (validResults.length === 0) {
      throw new Error('No valid movies found for the selected decade');
    }
    
    // Randomly select one movie from valid results
    const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
    return getMovieById(randomMovie.id);
    
  } catch (error) {
    console.error('Error getting random movie:', error);
    // Fallback to original popular movies if everything else fails
    const popularMovies = await getPopularMovies();
    const randomIndex = Math.floor(Math.random() * popularMovies.length);
    return getMovieById(popularMovies[randomIndex].id);
  }
};

