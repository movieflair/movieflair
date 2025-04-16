
import { supabase } from '@/integrations/supabase/client';

export async function callTMDB(path: string, searchParams: Record<string, any> = {}) {
  // Füge Standardparameter hinzu, wenn nicht angegeben
  const finalParams = {
    language: 'de-DE',
    ...searchParams
  };
  
  console.log(`Calling TMDB API: ${path} with params:`, finalParams);
  
  try {
    const { data, error } = await supabase.functions.invoke('tmdb', {
      body: { path, searchParams: finalParams },
    });

    if (error) {
      console.error('Error from Supabase TMDB function:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from TMDB API');
      return { results: [] };
    }
    
    return data;
  } catch (err) {
    console.error('Error calling TMDB API:', err);
    // Fallback zu leeren Ergebnissen im Fehlerfall
    return { results: [] };
  }
}

export const getAdminMovieSettings = async () => {
  try {
    // Fetch movie settings from Supabase
    const { data: savedMovies, error } = await supabase
      .from('admin_movies')
      .select('*');
    
    if (error) {
      console.error('Error fetching movie settings from Supabase:', error);
      return {};
    }
    
    if (!savedMovies || savedMovies.length === 0) {
      console.log('No saved movie settings found in Supabase');
      return {};
    }
    
    console.log(`Found ${savedMovies.length} saved movie settings in Supabase`);
    
    // Convert array to object indexed by movie ID
    const movieSettings = savedMovies.reduce((acc: Record<number, any>, movie: any) => {
      if (movie.id) {
        acc[movie.id] = movie;
      }
      return acc;
    }, {});
    
    return movieSettings;
  } catch (e) {
    console.error('Error processing saved movies:', e);
    return {};
  }
};

export const getAdminTvShowSettings = async () => {
  try {
    // Fetch TV show settings from Supabase
    const { data: savedShows, error } = await supabase
      .from('admin_shows')
      .select('*');
    
    if (error) {
      console.error('Error fetching TV show settings from Supabase:', error);
      return {};
    }
    
    if (!savedShows || savedShows.length === 0) {
      console.log('No saved TV show settings found in Supabase');
      return {};
    }
    
    console.log(`Found ${savedShows.length} saved TV show settings in Supabase`);
    
    return savedShows.reduce((acc: Record<number, any>, show: any) => {
      if (show.id) {
        acc[show.id] = show;
      }
      return acc;
    }, {});
  } catch (e) {
    console.error('Error processing saved shows:', e);
    return {};
  }
};
