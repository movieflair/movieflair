
// Functions for interacting with TMDB API
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch a movie from TMDB by ID
 */
export const fetchMovieFromTMDB = async (movieId: number): Promise<MovieDetail | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-admin', {
      body: { action: 'getById', movieId },
    });

    if (error) {
      console.error('Error fetching movie from TMDB:', error);
      return null;
    }

    return data as MovieDetail;
  } catch (error) {
    console.error('Error fetching movie from TMDB:', error);
    return null;
  }
};

/**
 * Search for movies on TMDB
 */
export const searchTMDBMovies = async (query: string, page = 1): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-admin', {
      body: { action: 'search', searchQuery: query, page },
    });

    if (error) {
      console.error('Error searching TMDB:', error);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
};

/**
 * Get popular movies from TMDB
 */
export const getPopularTMDBMovies = async (page = 1): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-admin', {
      body: { action: 'getPopular', page },
    });

    if (error) {
      console.error('Error getting popular movies from TMDB:', error);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error getting popular movies from TMDB:', error);
    return [];
  }
};
