
import { MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { getMovieById } from './basicMovieApi';

/**
 * Retrieves a random movie from the imported movies in our database
 */
export const getRandomImportedMovie = async (): Promise<MovieDetail> => {
  console.log('Hole zufälligen importierten Film...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('id')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen importierter Filme:', error);
      throw new Error('Fehler beim Laden importierter Filme');
    }
    
    if (!importedMovies || importedMovies.length === 0) {
      console.log('Keine importierten Filme in der Datenbank gefunden');
      throw new Error('Keine importierten Filme gefunden');
    }
    
    const randomIndex = Math.floor(Math.random() * importedMovies.length);
    const randomMovieId = importedMovies[randomIndex].id;
    
    console.log(`Zufällige Film-ID ausgewählt: ${randomMovieId}`);
    
    return getMovieById(randomMovieId);
    
  } catch (error) {
    console.error('Fehler beim Abrufen eines zufälligen importierten Films:', error);
    throw error;
  }
};
