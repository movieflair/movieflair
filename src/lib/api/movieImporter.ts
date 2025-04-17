
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
    toast.loading(`Importiere "${movie.title}"...`);
    
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if movie exists:', checkError);
      toast.dismiss();
      toast.error('Fehler beim Prüfen, ob der Film bereits existiert');
      return false;
    }
    
    if (existingMovie) {
      console.log(`Movie ${movie.id} already exists, checking if images need to be updated`);
      const success = await downloadMovieImagesToServer(movie);
      
      toast.dismiss();
      if (success) {
        toast.success(`Bilder für "${movie.title}" erfolgreich aktualisiert`);
      } else {
        toast.error(`Fehler beim Aktualisieren der Bilder für "${movie.title}"`);
      }
      
      return success;
    }
    
    const fullMovieData = await getMovieById(movie.id);
    
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
      hastrailer: !!fullMovieData.videos?.results?.some((v: any) => v.type === 'Trailer'),
      trailerurl: fullMovieData.videos?.results?.find((v: any) => v.type === 'Trailer')?.key ? 
        `https://www.youtube.com/embed/${fullMovieData.videos.results.find((v: any) => v.type === 'Trailer').key}` : ''
    };
    
    const { error: importError } = await supabase
      .from('admin_movies')
      .upsert(movieToImport);
      
    if (importError) {
      console.error('Error importing movie:', importError);
      toast.dismiss();
      toast.error(`Fehler beim Importieren von "${movie.title}"`);
      return false;
    }
    
    console.log(`Movie "${movie.title}" successfully imported to database`);
    
    console.log(`Downloading images for movie ${movie.id} to local storage...`);
    const imagesUpdated = await downloadMovieImagesToServer(movie);
    
    toast.dismiss();
    toast.success(`Film "${movie.title}" erfolgreich importiert`);
    
    return true;
  } catch (error) {
    console.error('Error importing movie from list:', error);
    toast.dismiss();
    toast.error(`Fehler beim Importieren des Films: ${error.message}`);
    return false;
  }
};
