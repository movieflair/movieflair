
import { MovieOrShow } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseMovieToMovieObject } from './movieUtils';

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
    console.log(`Found ${mappedMovies.length} free movies in Supabase`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Error processing free movies:', e);
    return [];
  }
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
      console.log(`Found ${trailerMovies.length} trailer movies in Supabase`);
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
      console.log(`Found ${trailerShows.length} TV shows with trailers in Supabase`);
    }
    
    trailerItems.sort((a, b) => {
      const dateA = new Date(b.updated_at || '');
      const dateB = new Date(a.updated_at || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`Total trailer items: ${trailerItems.length}`);
    return trailerItems as MovieOrShow[];
  } catch (e) {
    console.error('Error processing trailers:', e);
    return [];
  }
};

export const getImportedMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching imported movies from database...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching imported movies from Supabase:', error);
      return [];
    }
    
    if (!importedMovies) {
      console.log('No imported movies found in Supabase');
      return [];
    }
    
    const mappedMovies = importedMovies.map(mapSupabaseMovieToMovieObject);
    console.log(`Found ${mappedMovies.length} imported movies in Supabase`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Error processing imported movies:', e);
    return [];
  }
};
