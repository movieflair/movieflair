
import { ensureMovieImagesBucketExists } from './cms/imageApi';

/**
 * Initialize storage buckets
 */
export const setupStorage = async (): Promise<void> => {
  console.log('Setting up storage buckets...');
  
  try {
    // Ensure the movie_images bucket exists
    console.log('Creating movie_images bucket...');
    const bucketCreated = await ensureMovieImagesBucketExists();
    
    if (!bucketCreated) {
      console.error('Failed to create movie_images bucket');
      console.log('Note: You may need to create this bucket manually in the Supabase dashboard.');
    } else {
      console.log('Storage buckets set up successfully');
    }
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    console.log('Note: You may need to create this bucket manually in the Supabase dashboard.');
  }
};
