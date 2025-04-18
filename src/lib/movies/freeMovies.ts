
import { MovieOrShow } from '../types';
import { supabase } from '@/integrations/supabase/client';

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
    
    const mappedMovies = freeMovies.map(movie => ({
      id: movie.id,
      title: movie.title,
      name: movie.name,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      release_date: movie.release_date,
      genre_ids: [],
      media_type: 'movie' as const,
      hasStream: movie.hasstream || false,
      streamUrl: movie.streamurl || '',
      hasTrailer: movie.hastrailer || false,
      trailerUrl: movie.trailerurl || '',
      isFreeMovie: true,
      isNewTrailer: movie.isnewtrailer || false,
      popularity: movie.popularity || 0,
      updated_at: movie.updated_at
    }));
    
    console.log(`Found ${mappedMovies.length} free movies from Supabase`);
    return mappedMovies;
  } catch (e) {
    console.error('Error processing free movies:', e);
    return [];
  }
};
