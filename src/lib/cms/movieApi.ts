
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MovieOrShow } from '../types';

/**
 * Retrieves all movies from the database
 */
export const getAllMovies = async (): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('popularity', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
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
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Fehler beim Abrufen des Films:', error);
      return null;
    }
    
    return {
      ...data,
      runtime: data.runtime || null // Ensuring runtime is included
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
      .from('movies')
      .update({
        title: movie.title,
        overview: movie.overview,
        backdrop_path: movie.backdrop_path,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        popularity: movie.popularity,
        media_type: movie.media_type,
        isfreemovie: movie.isfreemovie,
        isnewtrailer: movie.isnewtrailer,
        hasstream: movie.hasstream,
        hastrailer: movie.hastrailer,
        runtime: movie.runtime || null // Ensuring runtime is included
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
      .from('movies')
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
