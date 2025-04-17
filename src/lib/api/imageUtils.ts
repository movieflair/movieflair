
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
    
    if (movie.poster_path && !movie.poster_path.startsWith('/storage')) {
      posterUpdated = await downloadAndUploadImage(movie.poster_path, 'posters', movie.id);
    }
    
    if (movie.backdrop_path && !movie.backdrop_path.startsWith('/storage')) {
      backdropUpdated = await downloadAndUploadImage(movie.backdrop_path, 'backdrops', movie.id);
    }
    
    // Get public URLs for the uploaded images
    let posterPath = '';
    let backdropPath = '';
    
    if (posterUpdated) {
      posterPath = `/storage/movie_images/posters/${movie.id}.jpg`;
    }
    
    if (backdropUpdated) {
      backdropPath = `/storage/movie_images/backdrops/${movie.id}.jpg`;
    }
    
    if (posterUpdated || backdropUpdated) {
      const updateData: any = {
        id: movie.id,
      };
      
      if (posterUpdated) {
        updateData.poster_path = posterPath;
      }
      
      if (backdropUpdated) {
        updateData.backdrop_path = backdropPath;
      }
      
      console.log('Updating movie data with local image paths:', updateData);
      
      const { error: updateError } = await supabase
        .from('admin_movies')
        .upsert(updateData);
      
      if (updateError) {
        console.error('Error updating movie with local paths:', updateError);
        return false;
      } else {
        console.log('Movie paths successfully updated in database');
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
      return false;
    } else {
      console.log(`${folderType} uploaded successfully:`, data?.path);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${folderType} image:`, error);
    return false;
  }
}
