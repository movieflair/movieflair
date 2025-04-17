
import { supabase } from '@/integrations/supabase/client';

/**
 * Stellt sicher, dass der Storage-Bucket für Filmbilder existiert
 * Sollte beim Start der App aufgerufen werden
 */
export const ensureStorageBucketExists = async (): Promise<void> => {
  try {
    console.log('Stelle sicher, dass movie_images Storage-Bucket existiert...');
    const { data, error } = await supabase.functions.invoke('create-movie-storage');
    
    if (error) {
      console.error('Fehler beim Erstellen des Storage-Buckets:', error);
    } else {
      console.log('Storage-Bucket-Setup-Antwort:', data);
    }
  } catch (error) {
    console.error('Fehler beim Einrichten des Speichers:', error);
  }
};
