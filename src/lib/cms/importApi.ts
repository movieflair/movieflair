
// Functions for importing movies from TMDB to our database
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { fetchMovieFromTMDB } from './tmdbApi';
import { downloadImageToStorage } from './imageApi';

/**
 * Import a movie from TMDB to our database
 */
export const importMovieFromTMDB = async (movieId: number): Promise<boolean> => {
  try {
    // First check if movie already exists
    const { data: existingMovie } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movieId)
      .maybeSingle();
      
    if (existingMovie) {
      console.log(`Movie ${movieId} already exists in database`);
      return true;
    }
    
    // Fetch the movie details from TMDB
    const movieDetails = await fetchMovieFromTMDB(movieId);
    if (!movieDetails) {
      return false;
    }
    
    // Download and store images locally
    let posterPath = null;
    let backdropPath = null;
    
    if (movieDetails.poster_path) {
      posterPath = await downloadImageToStorage(
        movieDetails.poster_path,
        'poster',
        movieDetails.id
      );
    }
    
    if (movieDetails.backdrop_path) {
      backdropPath = await downloadImageToStorage(
        movieDetails.backdrop_path,
        'backdrop',
        movieDetails.id
      );
    }
    
    // Prepare trailer URL if available
    const trailer = movieDetails.videos?.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    const trailerUrl = trailer 
      ? `https://www.youtube.com/embed/${trailer.key}` 
      : '';
    
    // Insert the movie into our database
    const { error } = await supabase.from('admin_movies').insert({
      id: movieDetails.id,
      title: movieDetails.title || '',
      overview: movieDetails.overview || '',
      poster_path: posterPath || movieDetails.poster_path || '',
      backdrop_path: backdropPath || movieDetails.backdrop_path || '',
      release_date: movieDetails.release_date || '',
      vote_average: movieDetails.vote_average || 0,
      vote_count: movieDetails.vote_count || 0,
      popularity: movieDetails.popularity || 0,
      media_type: 'movie',
      hastrailer: !!trailerUrl,
      trailerurl: trailerUrl,
      hasstream: false,
      streamurl: '',
      isfreemovie: false,
      isnewtrailer: false,
      runtime: movieDetails.runtime || null
    });
    
    if (error) {
      console.error('Error importing movie to database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error importing movie:', error);
    return false;
  }
};
