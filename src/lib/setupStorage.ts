
import { ensureMovieImagesBucketExists } from './storage';

/**
 * Ensures all storage buckets are set up
 */
export const ensureStorageBucketExists = async (): Promise<void> => {
  try {
    await ensureMovieImagesBucketExists();
    console.log('All storage buckets are set up');
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
  }
};
