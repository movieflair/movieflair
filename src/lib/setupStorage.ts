
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures that the necessary storage buckets exist for the application
 */
export const ensureStorageBucketExists = async (): Promise<void> => {
  try {
    // Check if the movie_images bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error);
      return;
    }
    
    const movieImagesBucket = buckets?.find(bucket => bucket.name === 'movie_images');
    
    if (!movieImagesBucket) {
      console.log('Creating movie_images bucket...');
      
      // Try to create the bucket
      const { error: createError } = await supabase.storage.createBucket('movie_images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('Error creating movie_images bucket:', createError);
        return;
      }
      
      console.log('movie_images bucket created successfully');
    } else {
      console.log('movie_images bucket already exists');
    }
    
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
  }
};
