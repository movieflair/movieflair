
import { ensureMovieImagesBucketExists } from './cms/imageApi';
import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize storage buckets
 */
export const setupStorage = async (): Promise<void> => {
  console.log('Setting up storage buckets...');
  
  try {
    // First, check if we have admin permissions by checking the storage.buckets table
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets. You may need admin privileges:', bucketsError);
      console.log('Attempting to create movie_images bucket through a dedicated function...');
      
      // Call our edge function to create the bucket with admin privileges
      const { error: functionError } = await supabase.functions.invoke('create-storage-bucket', {
        body: { bucketName: 'movie_images' }
      });
      
      if (functionError) {
        console.error('Error calling create-storage-bucket function:', functionError);
        console.log('Note: You may need to create the movie_images bucket manually in the Supabase dashboard.');
        return;
      }
      
      console.log('Storage bucket creation initiated through edge function.');
    } else {
      // If we can list buckets, we probably have permission to create them directly
      console.log('Creating movie_images bucket...');
      const bucketCreated = await ensureMovieImagesBucketExists();
      
      if (!bucketCreated) {
        console.error('Failed to create movie_images bucket');
        console.log('Note: You may need to create this bucket manually in the Supabase dashboard.');
      } else {
        console.log('Storage buckets set up successfully');
      }
    }
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    console.log('Note: You may need to create this bucket manually in the Supabase dashboard.');
  }
};
