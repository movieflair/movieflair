
// Functions for managing movie data in the admin CMS
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Update the MovieOrShow type for runtime (done in MovieList.tsx)

/**
 * Get all movies from our database
 */
export const getAllMovies = async (): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
    
    return (data || []).map(movie => ({
      ...movie,
      genre_ids: [], // Add an empty array for genre_ids
      media_type: 'movie' as const,
      hasStream: movie.hasstream,
      hasTrailer: movie.hastrailer,
      streamUrl: movie.streamurl,
      trailerUrl: movie.trailerurl,
      isFreeMovie: movie.isfreemovie,
      isNewTrailer: movie.isnewtrailer,
      runtime: movie.runtime || null // Include runtime with fallback
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

/**
 * Get a movie by ID from our database
 */
export const getMovieById = async (id: number): Promise<MovieOrShow | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching movie:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      ...data,
      genre_ids: [], // Add an empty array for genre_ids
      media_type: 'movie' as const,
      hasStream: data.hasstream,
      hasTrailer: data.hastrailer,
      streamUrl: data.streamurl,
      trailerUrl: data.trailerurl,
      isFreeMovie: data.isfreemovie,
      isNewTrailer: data.isnewtrailer,
      runtime: data.runtime || null // Include runtime with fallback
    };
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
};

/**
 * Update a movie in our database
 */
export const updateMovie = async (movie: Partial<MovieOrShow> & { id: number }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .update(movie)
      .eq('id', movie.id);
      
    if (error) {
      console.error('Error updating movie:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating movie:', error);
    return false;
  }
};

/**
 * Delete a movie from our database
 */
export const deleteMovie = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting movie:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting movie:', error);
    return false;
  }
};
