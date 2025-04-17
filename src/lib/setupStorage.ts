
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Initializes storage buckets with public access
 */
export const setupStorage = async (): Promise<void> => {
  console.log('Setting up storage buckets...');
  
  try {
    // Check if the bucket already exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      // Try to create the bucket through an Edge Function
      await createMovieBucketThroughEdgeFunction();
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'movie_images');
    
    if (!bucketExists) {
      console.log('Creating movie_images bucket...');
      
      try {
        // Try to create bucket directly
        const { error: createError } = await supabase.storage.createBucket('movie_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });
        
        if (createError) {
          console.error('Error creating bucket directly:', createError);
          // If direct creation fails, try through the Edge Function
          await createMovieBucketThroughEdgeFunction();
        } else {
          console.log('Successfully created movie_images bucket');
          
          // Create subfolders
          try {
            await supabase.storage.from('movie_images').upload('posters/.gitkeep', new Blob(['']));
            await supabase.storage.from('movie_images').upload('backdrops/.gitkeep', new Blob(['']));
            console.log('Created folder structure within bucket');
          } catch (folderError) {
            console.log('Could not create folders, but bucket exists:', folderError);
          }
        }
      } catch (error) {
        console.error('Failed to create bucket directly:', error);
        await createMovieBucketThroughEdgeFunction();
      }
    } else {
      console.log('movie_images bucket already exists');
      
      // Let's check if the bucket has the proper public access
      try {
        const { data: policyData, error: policyError } = await supabase.rpc('get_bucket_policy', { 
          bucket_name: 'movie_images' 
        });
        
        if (policyError) {
          console.log('Could not check bucket policy, assuming it needs to be public:', policyError);
          await createMovieBucketThroughEdgeFunction();
        } else if (!policyData?.public) {
          console.log('movie_images bucket exists but is not public, updating...');
          await createMovieBucketThroughEdgeFunction();
        } else {
          console.log('movie_images bucket exists and is properly configured');
        }
      } catch (error) {
        console.log('Error checking bucket policy:', error);
      }
    }
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    toast.error('Fehler beim Einrichten des Speicher-Buckets. Versuche es später erneut.');
  }
};

/**
 * Creates the movie_images bucket through the Edge Function
 */
async function createMovieBucketThroughEdgeFunction() {
  console.log('Attempting to create movie_images bucket through edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('create-storage-bucket', {
      body: { bucketName: 'movie_images' }
    });
    
    if (error) {
      console.error('Error calling create-storage-bucket function:', error);
      toast.error('Fehler beim Erstellen des Storage-Buckets. Bitte Serveradmin kontaktieren.');
      return;
    }
    
    console.log('Edge function response:', data);
    toast.success('Storage-Bucket wurde erfolgreich eingerichtet');
  } catch (error) {
    console.error('Error invoking edge function:', error);
    toast.error('Fehler beim Zugriff auf die Edge-Funktion');
  }
}
