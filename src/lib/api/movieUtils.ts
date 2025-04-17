
import { MovieOrShow } from '../types';
import { getAdminTvShowSettings } from '../apiUtils';
import { supabase } from '@/integrations/supabase/client';

export const mapSupabaseMovieToMovieObject = (movie: any): MovieOrShow => {
  const genres = movie.genre_ids || [];
  
  return {
    id: movie.id,
    title: movie.title,
    name: movie.name,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count || 0,
    release_date: movie.release_date,
    first_air_date: movie.first_air_date,
    genre_ids: genres,
    media_type: movie.media_type || 'movie',
    hasStream: movie.hasstream || false,
    streamUrl: movie.streamurl || '',
    hasTrailer: movie.hastrailer || false,
    trailerUrl: movie.trailerurl || '',
    isFreeMovie: movie.isfreemovie || false,
    isNewTrailer: movie.isnewtrailer || false,
    popularity: movie.popularity || 0
  };
};

export const deleteAllMovies = async (): Promise<boolean> => {
  try {
    console.log('Deleting all movies from the database...');
    
    // Delete all movies from admin_movies table
    const { error: moviesError } = await supabase
      .from('admin_movies')
      .delete()
      .neq('id', 0); // Delete all entries
    
    if (moviesError) {
      console.error('Error deleting all movies:', moviesError);
      return false;
    }
    
    // Delete all TV shows from admin_shows table
    const { error: showsError } = await supabase
      .from('admin_shows')
      .delete()
      .neq('id', 0); // Delete all entries
    
    if (showsError) {
      console.error('Error deleting all TV shows:', showsError);
      return false;
    }
    
    console.log('All movies and TV shows have been deleted');
    return true;
  } catch (error) {
    console.error('Error deleting all movies:', error);
    return false;
  }
};
