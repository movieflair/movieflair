
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import * as apiUtils from '../apiUtils';

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  console.log(`Fetching movie with ID: ${id} from database...`);
  
  try {
    const { data: movie, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching movie from database:', error);
      throw error;
    }
    
    if (movie) {
      console.log(`Found movie in database: ${movie.title}`);
      
      // Map database fields to MovieDetail object
      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        media_type: 'movie',
        genre_ids: [],
        hasStream: movie.hasstream,
        hasTrailer: movie.hastrailer,
        streamUrl: movie.streamurl,
        trailerUrl: movie.trailerurl,
        isFreeMovie: movie.isfreemovie,
        isNewTrailer: movie.isnewtrailer,
        videos: { results: [] } // Initialize empty videos array
      };
    }
    
    console.log(`Movie with ID ${id} not found in database, falling back to TMDB API`);
    
    // If not found in database, try to fetch from TMDB API
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'getById', movieId: id }
    });
    
    if (apiError) {
      console.error('Error fetching movie from TMDB:', apiError);
      throw apiError;
    }
    
    console.log(`Retrieved movie from TMDB API: ${apiData.title}`);
    return apiData;
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    throw error;
  }
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching popular movies...');
  
  try {
    // First, check if we have popular movies in our database
    const { data: dbMovies, error: dbError } = await supabase
      .from('admin_movies')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(20);
    
    if (dbError) {
      console.error('Error fetching popular movies from database:', dbError);
    } else if (dbMovies && dbMovies.length >= 10) {
      console.log(`Found ${dbMovies.length} popular movies in database`);
      
      return dbMovies.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        genre_ids: [],
        media_type: 'movie',
        popularity: movie.popularity,
        hasStream: movie.hasstream,
        hasTrailer: movie.hastrailer,
        streamUrl: movie.streamurl,
        trailerUrl: movie.trailerurl,
        isFreeMovie: movie.isfreemovie,
        isNewTrailer: movie.isnewtrailer
      }));
    }
    
    // If not enough movies in our database, fetch from TMDB API
    console.log('Not enough movies in database, falling back to TMDB API');
    
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'getPopular' }
    });
    
    if (apiError) {
      console.error('Error fetching popular movies from TMDB:', apiError);
      return [];
    }
    
    console.log(`Retrieved ${apiData.results.length} popular movies from TMDB API`);
    return apiData.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  console.log(`Searching for movies with query: ${query}`);
  
  if (!query || query.trim() === '') {
    console.log('Empty search query, returning empty results');
    return [];
  }
  
  try {
    // First, search our database
    const { data: dbMovies, error: dbError } = await supabase
      .from('admin_movies')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('popularity', { ascending: false })
      .limit(20);
    
    if (dbError) {
      console.error('Error searching movies in database:', dbError);
    } else if (dbMovies && dbMovies.length > 0) {
      console.log(`Found ${dbMovies.length} movies in database matching query: ${query}`);
      
      return dbMovies.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        genre_ids: [],
        media_type: 'movie',
        popularity: movie.popularity,
        hasStream: movie.hasstream,
        hasTrailer: movie.hastrailer,
        streamUrl: movie.streamurl,
        trailerUrl: movie.trailerurl,
        isFreeMovie: movie.isfreemovie,
        isNewTrailer: movie.isnewtrailer
      }));
    }
    
    // If no results in our database, search TMDB API
    console.log(`No results in database for query: ${query}, searching TMDB API`);
    
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'search', searchQuery: query }
    });
    
    if (apiError) {
      console.error('Error searching movies in TMDB:', apiError);
      return [];
    }
    
    console.log(`Retrieved ${apiData.results.length} movies from TMDB API matching query: ${query}`);
    return apiData.results;
  } catch (error) {
    console.error(`Error searching for movies with query: ${query}:`, error);
    return [];
  }
};

export const getPopularTvShows = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching popular TV shows...');
  
  try {
    // First check if we have TV shows in our database
    const { data: dbShows, error: dbError } = await supabase
      .from('admin_shows')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(20);
    
    if (dbError) {
      console.error('Error fetching popular TV shows from database:', dbError);
    } else if (dbShows && dbShows.length >= 10) {
      console.log(`Found ${dbShows.length} popular TV shows in database`);
      
      return dbShows.map(show => ({
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        backdrop_path: show.backdrop_path,
        overview: show.overview,
        first_air_date: show.first_air_date,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        genre_ids: [],
        media_type: 'tv',
        popularity: show.popularity,
        hasStream: show.hasstream,
        hasTrailer: show.hastrailer,
        streamUrl: show.streamurl,
        trailerUrl: show.trailerurl
      }));
    }
    
    // If not enough shows in our database, fetch from TMDB API
    console.log('Not enough TV shows in database, falling back to TMDB API');
    
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'getPopularTvShows' }
    });
    
    if (apiError) {
      console.error('Error fetching popular TV shows from TMDB:', apiError);
      return [];
    }
    
    console.log(`Retrieved ${apiData.results.length} popular TV shows from TMDB API`);
    return apiData.results;
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

export const searchTvShows = async (query: string): Promise<MovieOrShow[]> => {
  console.log(`Searching for TV shows with query: ${query}`);
  
  if (!query || query.trim() === '') {
    console.log('Empty search query, returning empty results');
    return [];
  }
  
  try {
    // First, search our database
    const { data: dbShows, error: dbError } = await supabase
      .from('admin_shows')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('popularity', { ascending: false })
      .limit(20);
    
    if (dbError) {
      console.error('Error searching TV shows in database:', dbError);
    } else if (dbShows && dbShows.length > 0) {
      console.log(`Found ${dbShows.length} TV shows in database matching query: ${query}`);
      
      return dbShows.map(show => ({
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        backdrop_path: show.backdrop_path,
        overview: show.overview,
        first_air_date: show.first_air_date,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        genre_ids: [],
        media_type: 'tv',
        popularity: show.popularity,
        hasStream: show.hasstream,
        hasTrailer: show.hastrailer,
        streamUrl: show.streamurl,
        trailerUrl: show.trailerurl
      }));
    }
    
    // If no results in our database, search TMDB API
    console.log(`No results in database for query: ${query}, searching TMDB API`);
    
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'searchTvShows', searchQuery: query }
    });
    
    if (apiError) {
      console.error('Error searching TV shows in TMDB:', apiError);
      return [];
    }
    
    console.log(`Retrieved ${apiData.results.length} TV shows from TMDB API matching query: ${query}`);
    return apiData.results;
  } catch (error) {
    console.error(`Error searching for TV shows with query: ${query}:`, error);
    return [];
  }
};

export const getSimilarMovies = async (movieId: number): Promise<MovieOrShow[]> => {
  console.log(`Fetching similar movies for ID: ${movieId}`);
  
  try {
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'getSimilar', movieId }
    });
    
    if (apiError) {
      console.error('Error fetching similar movies from TMDB:', apiError);
      return [];
    }
    
    console.log(`Retrieved ${apiData.results.length} similar movies from TMDB API`);
    return apiData.results;
  } catch (error) {
    console.error(`Error fetching similar movies for ID ${movieId}:`, error);
    return [];
  }
};

export const getRandomMovie = async (): Promise<MovieDetail> => {
  console.log('Fetching random movie...');
  
  try {
    // Get admin settings
    const adminSettings = apiUtils.getAdminSettings();
    
    // Call the random movie function
    const { data: apiData, error: apiError } = await supabase.functions.invoke('tmdb', {
      body: { action: 'getRandom' }
    });
    
    if (apiError) {
      console.error('Error fetching random movie from TMDB:', apiError);
      throw apiError;
    }
    
    console.log(`Retrieved random movie from TMDB API: ${apiData.title}`);
    return apiData;
  } catch (error) {
    console.error('Error fetching random movie:', error);
    throw error;
  }
};
