
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getMovieById } from './basicMovieApi';
import { downloadMovieImagesToServer } from './imageUtils';

/**
 * Imports a movie from TMDB into our local database
 */
export const importMovieFromTMDB = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Importing movie: ${movie.title} (ID: ${movie.id})`);
    
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if movie exists:', checkError);
      return false;
    }
    
    if (existingMovie) {
      console.log(`Movie ${movie.id} already exists, checking if images need to be updated`);
      const success = await downloadMovieImagesToServer(movie);
      
      if (success) {
        console.log(`Images for "${movie.title}" successfully updated`);
      } else {
        console.log(`Error updating images for "${movie.title}"`);
      }
      
      return success;
    }
    
    // Check if we have all required information from the movie object
    if (!movie.title || movie.id === undefined) {
      console.error('Missing required movie information:', movie);
      return false;
    }
    
    let fullMovieData: any = movie;
    
    try {
      // Try to get more detailed movie data if possible
      const detailedMovie = await getMovieById(movie.id);
      if (detailedMovie) {
        fullMovieData = detailedMovie;
      }
    } catch (error) {
      console.log('Could not fetch additional movie details, using provided data:', error);
      // Continue with the basic movie data we already have
    }
    
    // Prepare trailer URL if available
    let hasTrailer = false;
    let trailerUrl = '';
    
    if (fullMovieData.videos?.results?.length > 0) {
      const trailer = fullMovieData.videos.results.find((v: any) => v.type === 'Trailer');
      if (trailer && trailer.key) {
        hasTrailer = true;
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    
    const movieToImport = {
      id: movie.id,
      title: movie.title || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      overview: movie.overview || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      popularity: movie.popularity || 0,
      media_type: 'movie',
      isfreemovie: false,
      isnewtrailer: false,
      hasstream: false,
      streamurl: '',
      hastrailer: hasTrailer,
      trailerurl: trailerUrl
    };
    
    const { error: importError } = await supabase
      .from('admin_movies')
      .upsert(movieToImport);
      
    if (importError) {
      console.error('Error importing movie:', importError);
      return false;
    }
    
    console.log(`Movie "${movie.title}" successfully imported to database`);
    
    // Try to download images, but don't fail if it doesn't work
    try {
      console.log(`Downloading images for movie ${movie.id} to local storage...`);
      await downloadMovieImagesToServer(movie);
    } catch (imageError) {
      console.error('Error downloading images:', imageError);
      // Continue anyway, the movie is imported
    }
    
    return true;
  } catch (error) {
    console.error('Error importing movie from list:', error);
    return false;
  }
};
