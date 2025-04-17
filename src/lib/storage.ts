
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures the movie_images storage bucket exists
 */
export const ensureMovieImagesBucketExists = async (): Promise<boolean> => {
  try {
    // Check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'movie_images');
    
    if (!bucketExists) {
      console.log('Creating movie_images bucket...');
      const { error } = await supabase.storage.createBucket('movie_images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }
      
      // Create folders within the bucket
      await supabase.storage.from('movie_images').upload('posters/.gitkeep', new Blob(['']));
      await supabase.storage.from('movie_images').upload('backdrops/.gitkeep', new Blob(['']));
      
      console.log('movie_images bucket created successfully');
    } else {
      console.log('movie_images bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return false;
  }
};

/**
 * Upload an image to the movie_images bucket
 */
export const uploadMovieImage = async (
  file: File, 
  type: 'poster' | 'backdrop', 
  movieId: number
): Promise<string | null> => {
  try {
    const filePath = `${type}s/${movieId}_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('movie_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    const { data } = supabase.storage
      .from('movie_images')
      .getPublicUrl(filePath);
      
    return `/storage/movie_images/${filePath}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
