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
    const { data: adminMovies, error } = await supabase
      .from('admin_movies')
      .select('*');
    
    if (error) {
      console.error('Error fetching movie settings from Supabase:', error);
      return {};
    }
    
    if (!adminMovies || adminMovies.length === 0) {
      console.log('No saved movie settings found in Supabase');
      return {};
    }
    
    console.log(`Found ${adminMovies.length} saved movie settings in Supabase`);
    
    // Convert array to object indexed by movie ID
    const movieSettings = adminMovies.reduce((acc: Record<number, any>, movie: any) => {
      acc[movie.id] = movie;
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
    const { data: adminShows, error } = await supabase
      .from('admin_shows')
      .select('*');
    
    if (error) {
      console.error('Error fetching TV show settings from Supabase:', error);
      return {};
    }
    
    if (!adminShows || adminShows.length === 0) {
      console.log('No saved TV show settings found in Supabase');
      return {};
    }
    
    console.log(`Found ${adminShows.length} saved TV show settings in Supabase`);
    
    return adminShows.reduce((acc: Record<number, any>, show: any) => {
      acc[show.id] = show;
      return acc;
    }, {});
  } catch (e) {
    console.error('Error processing saved shows:', e);
    return {};
  }
};
