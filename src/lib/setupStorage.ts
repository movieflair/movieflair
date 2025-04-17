
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures the storage bucket for movie images exists
 * Should be called when the app initializes
 */
export const ensureStorageBucketExists = async (): Promise<void> => {
  try {
    console.log('Ensuring movie_images storage bucket exists...');
    const { data, error } = await supabase.functions.invoke('create-storage-bucket');
    
    if (error) {
      console.error('Error creating storage bucket:', error);
    } else {
      console.log('Storage bucket setup response:', data);
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};
