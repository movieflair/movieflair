
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures the storage bucket for movie images exists
 * Should be called on app startup
 */
export const ensureStorageBucketExists = async (): Promise<void> => {
  try {
    console.log('Ensuring movie_images storage bucket exists...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'movie_images');
    
    if (!bucketExists) {
      console.log('Creating movie_images storage bucket...');
      
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase.functions.invoke('create-storage-bucket', {
        body: { bucketName: 'movie_images' }
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket created successfully:', data);
        
        // Create the necessary folders
        await Promise.all([
          supabase.storage.from('movie_images').upload('posters/.keep', new Blob([''])),
          supabase.storage.from('movie_images').upload('backdrops/.keep', new Blob(['']))
        ]);
        
        console.log('Created folders in the movie_images bucket');
      }
    } else {
      console.log('movie_images bucket already exists');
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};
