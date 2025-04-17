import { MovieOrShow, MovieDetail } from './types';
import { getAdminMovieSettings, getAdminTvShowSettings } from './apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { callTMDB } from './apiUtils';

const mapSupabaseMovieToMovieObject = (movie: any): MovieOrShow => {
  const genres = movie.genre_ids || [];
  
  return {
    id: movie.id,
    title: movie.title,
    name: movie.name,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    release_date: movie.release_date,
    first_air_date: movie.first_air_date,
    genre_ids: genres,
    media_type: movie.media_type || 'movie',
    hasStream: movie.hasstream || false,
    streamUrl: movie.streamurl || '',
    hasTrailer: movie.hastrailer || false,
    trailerUrl: movie.trailerurl || '',
    isFreeMovie: movie.isfreemovie || false,
    isNewTrailer: movie.isnewtrailer || false,
    popularity: movie.popularity || 0
  };
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching trailer movies...');
  let trailerItems: any[] = [];
  
  try {
    const { data: trailerMovies, error: moviesError } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('isnewtrailer', true)
      .order('updated_at', { ascending: false });
    
    if (moviesError) {
      console.error('Error fetching trailer movies from Supabase:', moviesError);
    } else if (trailerMovies) {
      trailerItems = [...trailerItems, ...trailerMovies.map(mapSupabaseMovieToMovieObject)];
      console.log(`Found ${trailerMovies.length} trailer movies from Supabase`);
    }
    
    const { data: trailerShows, error: showsError } = await supabase
      .from('admin_shows')
      .select('*')
      .eq('hastrailer', true)
      .order('updated_at', { ascending: false });
    
    if (showsError) {
      console.error('Error fetching trailer shows from Supabase:', showsError);
    } else if (trailerShows) {
      trailerItems = [...trailerItems, ...trailerShows.map(mapSupabaseMovieToMovieObject)];
      console.log(`Found ${trailerShows.length} TV shows with trailers from Supabase`);
    }
    
    // Sort all items by updated_at (newest first)
    trailerItems.sort((a, b) => {
      const dateA = new Date(a.updated_at || '');
      const dateB = new Date(b.updated_at || '');
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Total trailer items: ${trailerItems.length}`);
    return trailerItems as MovieOrShow[];
  } catch (e) {
    console.error('Error processing trailers:', e);
    return [];
  }
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching free movies...');
  
  try {
    const { data: freeMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('isfreemovie', true)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching free movies from Supabase:', error);
      return [];
    }
    
    if (!freeMovies) {
      console.log('No free movies found in Supabase');
      return [];
    }
    
    const mappedMovies = freeMovies.map(mapSupabaseMovieToMovieObject);
    console.log(`Found ${mappedMovies.length} free movies from Supabase`);
    return mappedMovies as MovieOrShow[];
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
  // First check if movie exists in our database with custom settings
  const { data: adminMovie, error: adminError } = await supabase
    .from('admin_movies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (adminError) {
    console.error('Error fetching movie from Supabase:', adminError);
  }

  // Then fetch the movie data from TMDB API
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  // If we have admin settings, use those values
  if (adminMovie) {
    console.log('Found movie in admin_movies table:', adminMovie);
    return {
      ...movieData,
      media_type: 'movie',
      videos: { results: videos.results },
      cast: credits.cast?.slice(0, 10),
      crew: credits.crew,
      hasTrailer: adminMovie.hastrailer || videos.results?.some((v: any) => v.type === 'Trailer'),
      hasStream: adminMovie.hasstream || false,
      streamUrl: adminMovie.streamurl || '',
      trailerUrl: adminMovie.trailerurl || '',
      isFreeMovie: adminMovie.isfreemovie || false,
      isNewTrailer: adminMovie.isnewtrailer || false,
    };
  }

  // Fallback to the general admin settings
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
  
  const allDecades = ['1970', '1980', '1990', '2000', '2010', '2020'];
  
  const randomDecade = allDecades[Math.floor(Math.random() * allDecades.length)];
  console.log(`Selected random decade: ${randomDecade}`);
  
  try {
    let params: Record<string, any> = {
      'sort_by': 'popularity.desc',
      'vote_count.gte': '5',
      'include_adult': 'false',
      'include_video': 'false',
      'page': '1',
    };
    
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
    
    const data = await callTMDB('/discover/movie', params);
    
    if (!data.results || data.results.length === 0) {
      console.log('No results found, trying with fewer restrictions');
      
      params.vote_count_gte = '3';
      const fallbackData = await callTMDB('/discover/movie', params);
      
      if (!fallbackData.results || fallbackData.results.length === 0) {
        throw new Error('No movies found for the selected decade');
      }
      
      const validResults = fallbackData.results
        .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
      
      if (validResults.length === 0) {
        throw new Error('No valid movies found for the selected decade');
      }
      
      const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
      return getMovieById(randomMovie.id);
    }
    
    const validResults = data.results
      .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
    
    if (validResults.length === 0) {
      throw new Error('No valid movies found for the selected decade');
    }
    
    const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
    return getMovieById(randomMovie.id);
    
  } catch (error) {
    console.error('Error getting random movie:', error);
    const popularMovies = await getPopularMovies();
    const randomIndex = Math.floor(Math.random() * popularMovies.length);
    return getMovieById(popularMovies[randomIndex].id);
  }
};
