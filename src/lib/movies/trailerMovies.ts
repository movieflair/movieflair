
import { MovieOrShow } from '../types';
import { supabase } from '@/integrations/supabase/client';

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
      trailerItems = [...trailerItems, ...trailerMovies.map(movie => ({
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
        isFreeMovie: movie.isfreemovie || false,
        isNewTrailer: true,
        popularity: movie.popularity || 0,
        updated_at: movie.updated_at
      }))];
      console.log(`Found ${trailerMovies.length} trailer movies from Supabase`);
    }
    
    const { data: trailerShows, error: showsError } = await supabase
      .from('admin_shows')
      .select('*')
      .eq('hastrailer', true)
      .order('updated_at', { ascending: false });
    
    if (showsError) {
      console.error('Error fetching trailer shows from Supabase:', showsError);
    } else if (trailerShows) {
      trailerItems = [...trailerItems, ...trailerShows.map(show => ({
        id: show.id,
        title: show.name,
        name: show.name,
        poster_path: show.poster_path,
        backdrop_path: show.backdrop_path,
        overview: show.overview,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        first_air_date: show.first_air_date,
        genre_ids: [],
        media_type: 'tv' as const,
        hasStream: show.hasstream || false,
        streamUrl: show.streamurl || '',
        hasTrailer: true,
        trailerUrl: show.trailerurl || '',
        isFreeMovie: false,
        isNewTrailer: true,
        popularity: show.popularity || 0,
        updated_at: show.updated_at
      }))];
      console.log(`Found ${trailerShows.length} TV shows with trailers from Supabase`);
    }
    
    trailerItems.sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });
    
    return trailerItems as MovieOrShow[];
  } catch (e) {
    console.error('Error processing trailers:', e);
    return [];
  }
};
