
import { supabase } from '@/integrations/supabase/client';
import { ensureMovieImagesBucketExists } from '@/lib/api';

/**
 * Setup all necessary storage buckets and permissions
 */
export const setupStorage = async (): Promise<boolean> => {
  try {
    console.log('Setting up storage buckets...');
    
    // Ensure the movie_images bucket exists
    const movieImagesCreated = await ensureMovieImagesBucketExists();
    
    if (!movieImagesCreated) {
      console.error('Failed to create movie_images bucket');
      return false;
    }
    
    console.log('Storage setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up storage:', error);
    return false;
  }
};
