
import { supabase } from '@/integrations/supabase/client';
import { MovieOrShow } from '../types';

/**
 * Downloads and stores movie images to the server
 */
export const downloadMovieImagesToServer = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Downloading images for movie ${movie.id} to server...`);
    
    let posterUpdated = false;
    let backdropUpdated = false;
    
    // Use the dedicated Edge Function for poster
    if (movie.poster_path && !movie.poster_path.startsWith('/storage')) {
      try {
        const { data, error } = await supabase.functions.invoke('create-movie-storage', {
          body: {
            movieId: movie.id,
            imageUrl: movie.poster_path,
            imageType: 'poster'
          }
        });
        
        if (error) {
          console.error('Error uploading poster through Edge Function:', error);
        } else {
          console.log('Poster uploaded successfully:', data?.publicUrl);
          posterUpdated = true;
        }
      } catch (posterError) {
        console.error('Error calling poster upload function:', posterError);
      }
    }
    
    // Use the dedicated Edge Function for backdrop
    if (movie.backdrop_path && !movie.backdrop_path.startsWith('/storage')) {
      try {
        const { data, error } = await supabase.functions.invoke('create-movie-storage', {
          body: {
            movieId: movie.id,
            imageUrl: movie.backdrop_path,
            imageType: 'backdrop'
          }
        });
        
        if (error) {
          console.error('Error uploading backdrop through Edge Function:', error);
        } else {
          console.log('Backdrop uploaded successfully:', data?.publicUrl);
          backdropUpdated = true;
        }
      } catch (backdropError) {
        console.error('Error calling backdrop upload function:', backdropError);
      }
    }
    
    return posterUpdated || backdropUpdated;
  } catch (error) {
    console.error('Error downloading images to server:', error);
    return false;
  }
};

/**
 * Helper function to download and upload an image
 * This function is kept for legacy compatibility, but we prefer to use the Edge Function
 */
async function downloadAndUploadImage(
  imagePath: string, 
  folderType: 'posters' | 'backdrops', 
  movieId: number
): Promise<boolean> {
  let imageUrl = imagePath;
  
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://image.tmdb.org/t/p/original${imageUrl}`;
  }
  
  console.log(`Downloading ${folderType} from ${imageUrl}`);
  
  try {
    const imageRes = await fetch(imageUrl);
    
    if (!imageRes.ok) {
      console.error(`Error downloading image: ${imageRes.statusText}`);
      return false;
    }
    
    const imageBlob = await imageRes.blob();
    const filename = `${movieId}.jpg`;
    
    console.log(`Uploading ${folderType} as ${filename} to movie_images/${folderType} bucket`);
    
    const { data, error } = await supabase.storage
      .from('movie_images')
      .upload(`${folderType}/${filename}`, imageBlob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading ${folderType}:`, error);
      
      // Try to use the edge function instead
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-movie-storage', {
          body: {
            movieId,
            imageUrl: imagePath,
            imageType: folderType === 'posters' ? 'poster' : 'backdrop'
          }
        });
        
        if (edgeError) {
          console.error(`Error uploading ${folderType} through Edge Function:`, edgeError);
          return false;
        }
        
        console.log(`${folderType} uploaded successfully through Edge Function:`, edgeData?.publicUrl);
        return true;
      } catch (edgeCallError) {
        console.error(`Error calling upload function for ${folderType}:`, edgeCallError);
        return false;
      }
    } else {
      console.log(`${folderType} uploaded successfully:`, data?.path);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${folderType} image:`, error);
    
    // Try using the edge function as a fallback
    try {
      const { data, error: edgeError } = await supabase.functions.invoke('create-movie-storage', {
        body: {
          movieId,
          imageUrl: imagePath,
          imageType: folderType === 'posters' ? 'poster' : 'backdrop'
        }
      });
      
      if (edgeError) {
        console.error(`Fallback: Error uploading ${folderType} through Edge Function:`, edgeError);
        return false;
      }
      
      console.log(`Fallback: ${folderType} uploaded successfully through Edge Function:`, data?.publicUrl);
      return true;
    } catch (edgeCallError) {
      console.error(`Fallback: Error calling upload function for ${folderType}:`, edgeCallError);
      return false;
    }
  }
}
