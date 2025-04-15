
import { supabase } from '@/integrations/supabase/client';

export async function callTMDB(path: string, searchParams = {}) {
  const params = {
    ...searchParams,
    language: 'de-DE'
  };
  
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { path, searchParams: params },
  });

  if (error) throw error;
  return data;
}

export const getAdminMovieSettings = async () => {
  const savedMoviesJson = localStorage.getItem('adminMovies');
  if (!savedMoviesJson) {
    console.log('No saved movie settings found in localStorage');
    return {};
  }
  
  try {
    const savedMovies = JSON.parse(savedMoviesJson);
    console.log(`Found ${savedMovies.length} saved movie settings in localStorage`);
    
    // Convert array to object indexed by movie ID
    const movieSettings = savedMovies.reduce((acc: Record<number, any>, movie: any) => {
      if (movie.id) {
        acc[movie.id] = movie;
      }
      return acc;
    }, {});
    
    return movieSettings;
  } catch (e) {
    console.error('Error parsing saved movies:', e);
    return {};
  }
};

export const getAdminTvShowSettings = async () => {
  const savedShowsJson = localStorage.getItem('adminShows');
  if (!savedShowsJson) {
    console.log('No saved TV show settings found in localStorage');
    return {};
  }
  
  try {
    const savedShows = JSON.parse(savedShowsJson);
    console.log(`Found ${savedShows.length} saved TV show settings in localStorage`);
    
    return savedShows.reduce((acc: Record<number, any>, show: any) => {
      if (show.id) {
        acc[show.id] = show;
      }
      return acc;
    }, {});
  } catch (e) {
    console.error('Error parsing saved shows:', e);
    return {};
  }
};
