
import { supabase } from '@/integrations/supabase/client';
import { MovieDetail, MovieOrShow } from './types';

// Exportieren der neuen Funktion zum Abrufen von TV-Shows aus der Datenbank
export const getTvShowById = async (id: number): Promise<MovieOrShow | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_shows')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching TV show from database:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      ...data,
      genre_ids: [], 
      media_type: 'tv' as const,
      hasStream: data.hasstream,
      hasTrailer: data.hastrailer,
      streamUrl: data.streamurl,
      trailerUrl: data.trailerurl,
    };
  } catch (error) {
    console.error('Error fetching TV show from database:', error);
    return null;
  }
};

// TMDB API-Funktion zum Abrufen der TV-Show-Details
export const getTvShowDetails = async (id: string | number): Promise<MovieDetail> => {
  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=de-DE&append_to_response=videos,credits`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Extrahiere Cast und Crew aus den Credits
    const cast = data.credits?.cast || [];
    const crew = data.credits?.crew || [];

    return {
      ...data,
      media_type: 'tv',
      cast,
      crew,
      genre_ids: data.genres?.map((g: any) => g.id) || [],
    };
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw new Error('Failed to fetch TV show details');
  }
};

// Funktion zum Abrufen des Casts für einen Film oder eine TV-Show
export const getCast = async (id: string | number, type: 'movie' | 'tv'): Promise<any[]> => {
  try {
    const url = `https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=de-DE`;
    const response = await fetch(url);
    const data = await response.json();
    return data.cast || [];
  } catch (error) {
    console.error(`Error fetching ${type} cast:`, error);
    return [];
  }
};

// Funktion zum Abrufen beliebter TV-Shows
export const getPopularTvShows = async (page = 1): Promise<MovieOrShow[]> => {
  try {
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=de-DE&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      overview: show.overview,
      vote_average: show.vote_average,
      first_air_date: show.first_air_date,
      genre_ids: show.genre_ids || [],
      media_type: 'tv',
    }));
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

// Funktion zum Suchen von TV-Shows
export const searchTvShows = async (query: string, page = 1): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  try {
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=de-DE&query=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      overview: show.overview,
      vote_average: show.vote_average,
      first_air_date: show.first_air_date,
      genre_ids: show.genre_ids || [],
      media_type: 'tv',
    }));
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return [];
  }
};
