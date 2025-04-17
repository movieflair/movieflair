import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures that the storage bucket for movie images exists
 */
export const ensureStorageBucketExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if movie_images storage bucket exists...');
    
    // First check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'movie_images');
    
    if (bucketExists) {
      console.log('movie_images bucket already exists.');
      return true;
    }
    
    console.log('movie_images bucket does not exist, creating it...');
    
    // Use the create-storage-bucket edge function to create the bucket with proper policies
    const { data, error } = await supabase.functions.invoke('create-storage-bucket', {
      body: { name: 'movie_images' }
    });
    
    if (error) {
      console.error('Error creating movie_images bucket:', error);
      return false;
    }
    
    console.log('Successfully created movie_images bucket:', data);
    
    // Create the folder structure
    await Promise.all([
      createFolderIfNotExists('movie_images', 'posters'),
      createFolderIfNotExists('movie_images', 'backdrops')
    ]);
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return false;
  }
};

/**
 * Creates a folder in a storage bucket if it doesn't exist
 */
const createFolderIfNotExists = async (bucketName: string, folderName: string): Promise<boolean> => {
  try {
    // Check if folder exists by listing files with this prefix
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folderName);
    
    if (listError && listError.message !== 'The resource was not found') {
      console.error(`Error checking if folder ${folderName} exists:`, listError);
      // If it's not a "not found" error, something else is wrong
      return false;
    }
    
    // If we got data back, the folder exists
    if (files) {
      console.log(`Folder ${folderName} already exists in bucket ${bucketName}`);
      return true;
    }
    
    // Create an empty .keep file to create the folder
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`${folderName}/.keep`, new Blob([''], { type: 'text/plain' }));
    
    if (uploadError) {
      console.error(`Error creating folder ${folderName}:`, uploadError);
      return false;
    }
    
    console.log(`Successfully created folder ${folderName} in bucket ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error);
    return false;
  }
};
