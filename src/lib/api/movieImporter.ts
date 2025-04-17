
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Imports a movie from TMDB into our local database
 */
export const importMovieFromTMDB = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Importing movie: ${movie.title || 'Unknown'} (ID: ${movie.id})`);
    
    // First check if movie already exists
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if movie exists:', checkError);
      return false;
    }
    
    // Get detailed movie information from TMDB
    let fullMovieData: any = { ...movie };
    
    try {
      const { data: movieDetails, error } = await supabase.functions.invoke('tmdb-admin', {
        body: { 
          action: 'getById',
          movieId: movie.id
        }
      });
      
      if (error) {
        console.error('Error fetching detailed movie data:', error);
      } else if (movieDetails) {
        console.log('Retrieved detailed movie data from TMDB');
        fullMovieData = {
          ...fullMovieData,
          ...movieDetails
        };
      }
    } catch (error) {
      console.log('Could not fetch additional movie details, using provided data:', error);
    }
    
    // Prepare trailer URL if available
    let hasTrailer = fullMovieData.hasTrailer || false;
    let trailerUrl = fullMovieData.trailerUrl || '';
    
    if (fullMovieData.videos?.results?.length > 0 && !trailerUrl) {
      const trailer = fullMovieData.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer && trailer.key) {
        hasTrailer = true;
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    
    if (existingMovie) {
      console.log(`Movie ${movie.id} already exists, updating data`);
      
      // Update the movie data in our database
      const { error: updateError } = await supabase
        .from('admin_movies')
        .update({
          title: fullMovieData.title || '',
          overview: fullMovieData.overview || '',
          poster_path: fullMovieData.poster_path || '',
          backdrop_path: fullMovieData.backdrop_path || '',
          release_date: fullMovieData.release_date || '',
          vote_average: fullMovieData.vote_average || 0,
          vote_count: fullMovieData.vote_count || 0,
          popularity: fullMovieData.popularity || 0,
          hastrailer: hasTrailer,
          trailerurl: trailerUrl
        })
        .eq('id', movie.id);
        
      if (updateError) {
        console.error('Error updating movie data:', updateError);
        return false;
      }
      
      console.log(`Movie "${fullMovieData.title}" data successfully updated`);
      return true;
    }
    
    // If movie doesn't exist, create a new entry
    const movieToImport = {
      id: movie.id,
      title: fullMovieData.title || '',
      poster_path: fullMovieData.poster_path || '',
      backdrop_path: fullMovieData.backdrop_path || '',
      overview: fullMovieData.overview || '',
      release_date: fullMovieData.release_date || '',
      vote_average: fullMovieData.vote_average || 0,
      vote_count: fullMovieData.vote_count || 0,
      popularity: fullMovieData.popularity || 0,
      media_type: 'movie',
      isfreemovie: false,
      isnewtrailer: false,
      hasstream: false,
      streamurl: '',
      hastrailer: hasTrailer,
      trailerurl: trailerUrl
    };
    
    console.log('Inserting movie into database:', movieToImport);
    
    const { error: importError } = await supabase
      .from('admin_movies')
      .insert(movieToImport);
      
    if (importError) {
      console.error('Error importing movie:', importError);
      return false;
    }
    
    console.log(`Movie "${fullMovieData.title}" successfully imported to database`);
    return true;
  } catch (error) {
    console.error('Error importing movie:', error);
    return false;
  }
};
