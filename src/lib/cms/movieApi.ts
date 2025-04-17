
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MovieOrShow } from '../types';

/**
 * Retrieves all movies from the database
 */
export const getAllMovies = async (): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('*')
      .order('popularity', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Map from database model to application model
    return (data || []).map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      backdrop_path: movie.backdrop_path || '',
      poster_path: movie.poster_path || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      popularity: movie.popularity || 0,
      media_type: movie.media_type as 'movie' | 'tv',
      isFreeMovie: movie.isfreemovie || false,
      isNewTrailer: movie.isnewtrailer || false,
      hasStream: movie.hasstream || false,
      hasTrailer: movie.hastrailer || false,
      streamUrl: movie.streamurl || '',
      trailerUrl: movie.trailerurl || '',
      runtime: movie.runtime || null,
      genre_ids: [], // Required by MovieOrShow type
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Filme:', error);
    return [];
  }
};

/**
 * Retrieves a single movie by ID
 */
export const getMovieById = async (id: number): Promise<MovieOrShow | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Fehler beim Abrufen des Films:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      overview: data.overview || '',
      backdrop_path: data.backdrop_path || '',
      poster_path: data.poster_path || '',
      release_date: data.release_date || '',
      vote_average: data.vote_average || 0,
      popularity: data.popularity || 0,
      media_type: data.media_type as 'movie' | 'tv',
      isFreeMovie: data.isfreemovie || false,
      isNewTrailer: data.isnewtrailer || false,
      hasStream: data.hasstream || false,
      hasTrailer: data.hastrailer || false,
      streamUrl: data.streamurl || '',
      trailerUrl: data.trailerurl || '',
      runtime: data.runtime || null,
      genre_ids: [], // Required by MovieOrShow type
    };
  } catch (error) {
    console.error('Fehler beim Abrufen des Films:', error);
    return null;
  }
};

/**
 * Updates a movie in the database
 */
export const updateMovie = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .update({
        title: movie.title,
        overview: movie.overview,
        backdrop_path: movie.backdrop_path,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        popularity: movie.popularity,
        media_type: movie.media_type,
        isfreemovie: movie.isFreeMovie,
        isnewtrailer: movie.isNewTrailer,
        hasstream: movie.hasStream,
        hastrailer: movie.hasTrailer,
        streamurl: movie.streamUrl || null, 
        trailerurl: movie.trailerUrl || null,
        runtime: movie.runtime || null
      })
      .eq('id', movie.id);
    
    if (error) {
      console.error('Fehler beim Aktualisieren des Films:', error);
      toast.error('Fehler beim Aktualisieren des Films');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Films:', error);
    toast.error('Fehler beim Aktualisieren des Films');
    return false;
  }
};

/**
 * Deletes a movie from the database
 */
export const deleteMovie = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen des Films:', error);
      toast.error('Fehler beim Löschen des Films');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen des Films:', error);
    toast.error('Fehler beim Löschen des Films');
    return false;
  }
};
