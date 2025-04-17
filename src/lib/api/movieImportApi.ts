
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getMovieById } from './basicMovieApi';
import { mapSupabaseMovieToMovieObject } from './movieUtils';

export const downloadMovieImagesToServer = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Downloading images for movie ${movie.id} to server...`);
    
    let posterUpdated = false;
    let backdropUpdated = false;
    
    if (movie.poster_path && !movie.poster_path.startsWith('/storage')) {
      let posterUrl = movie.poster_path;
      
      if (posterUrl.startsWith('/')) {
        posterUrl = `https://image.tmdb.org/t/p/original${posterUrl}`;
      }
      
      console.log(`Downloading poster from ${posterUrl}`);
      try {
        const posterRes = await fetch(posterUrl);
        
        if (!posterRes.ok) {
          console.error(`Error downloading poster: ${posterRes.statusText}`);
          return false;
        }
        
        const posterBlob = await posterRes.blob();
        const posterFilename = `${movie.id}.jpg`;
        
        console.log(`Uploading poster as ${posterFilename} to movie_images/posters bucket`);
        
        const { data: posterData, error: posterError } = await supabase.storage
          .from('movie_images')
          .upload(`posters/${posterFilename}`, posterBlob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (posterError) {
          console.error('Error uploading poster:', posterError);
        } else {
          console.log('Poster uploaded successfully:', posterData?.path);
          posterUpdated = true;
        }
      } catch (error) {
        console.error('Error processing poster image:', error);
      }
    }
    
    if (movie.backdrop_path && !movie.backdrop_path.startsWith('/storage')) {
      let backdropUrl = movie.backdrop_path;
      
      if (backdropUrl.startsWith('/')) {
        backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;
      }
      
      console.log(`Downloading backdrop from ${backdropUrl}`);
      try {
        const backdropRes = await fetch(backdropUrl);
        
        if (!backdropRes.ok) {
          console.error(`Error downloading backdrop: ${backdropRes.statusText}`);
          return false;
        }
        
        const backdropBlob = await backdropRes.blob();
        const backdropFilename = `${movie.id}.jpg`;
        
        console.log(`Uploading backdrop as ${backdropFilename} to movie_images/backdrops bucket`);
        
        const { data: backdropData, error: backdropError } = await supabase.storage
          .from('movie_images')
          .upload(`backdrops/${backdropFilename}`, backdropBlob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (backdropError) {
          console.error('Error uploading backdrop:', backdropError);
        } else {
          console.log('Backdrop uploaded successfully:', backdropData?.path);
          backdropUpdated = true;
        }
      } catch (error) {
        console.error('Error processing backdrop image:', error);
      }
    }
    
    // Get public URLs for the uploaded images
    let posterPath = '';
    let backdropPath = '';
    
    if (posterUpdated) {
      const { data: posterPublicUrlData } = supabase.storage
        .from('movie_images')
        .getPublicUrl(`posters/${movie.id}.jpg`);
      
      posterPath = `/storage/movie_images/posters/${movie.id}.jpg`;
    }
    
    if (backdropUpdated) {
      const { data: backdropPublicUrlData } = supabase.storage
        .from('movie_images')
        .getPublicUrl(`backdrops/${movie.id}.jpg`);
      
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

export const importMovieFromTMDB = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Importing movie: ${movie.title} (ID: ${movie.id})`);
    toast.loading(`Importiere "${movie.title}"...`);
    
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if movie exists:', checkError);
      toast.dismiss();
      toast.error('Fehler beim Prüfen, ob der Film bereits existiert');
      return false;
    }
    
    if (existingMovie) {
      console.log(`Movie ${movie.id} already exists, checking if images need to be updated`);
      const success = await downloadMovieImagesToServer(movie);
      
      toast.dismiss();
      if (success) {
        toast.success(`Bilder für "${movie.title}" erfolgreich aktualisiert`);
      } else {
        toast.error(`Fehler beim Aktualisieren der Bilder für "${movie.title}"`);
      }
      
      return success;
    }
    
    const fullMovieData = await getMovieById(movie.id);
    
    const movieToImport = {
      id: movie.id,
      title: movie.title || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      overview: movie.overview || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      popularity: movie.popularity || 0,
      media_type: 'movie',
      isfreemovie: false,
      isnewtrailer: false,
      hasstream: false,
      streamurl: '',
      hastrailer: !!fullMovieData.videos?.results?.some((v: any) => v.type === 'Trailer'),
      trailerurl: fullMovieData.videos?.results?.find((v: any) => v.type === 'Trailer')?.key ? 
        `https://www.youtube.com/embed/${fullMovieData.videos.results.find((v: any) => v.type === 'Trailer').key}` : ''
    };
    
    const { error: importError } = await supabase
      .from('admin_movies')
      .upsert(movieToImport);
      
    if (importError) {
      console.error('Error importing movie:', importError);
      toast.dismiss();
      toast.error(`Fehler beim Importieren von "${movie.title}"`);
      return false;
    }
    
    console.log(`Movie "${movie.title}" successfully imported to database`);
    
    console.log(`Downloading images for movie ${movie.id} to local storage...`);
    const imagesUpdated = await downloadMovieImagesToServer(movie);
    
    toast.dismiss();
    toast.success(`Film "${movie.title}" erfolgreich importiert`);
    
    return true;
  } catch (error) {
    console.error('Error importing movie from list:', error);
    toast.dismiss();
    toast.error(`Fehler beim Importieren des Films: ${error.message}`);
    return false;
  }
};

export const getRandomImportedMovie = async (): Promise<MovieDetail> => {
  console.log('Hole zufälligen importierten Film...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('id')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen importierter Filme:', error);
      throw new Error('Fehler beim Laden importierter Filme');
    }
    
    if (!importedMovies || importedMovies.length === 0) {
      console.log('Keine importierten Filme in der Datenbank gefunden');
      throw new Error('Keine importierten Filme gefunden');
    }
    
    const randomIndex = Math.floor(Math.random() * importedMovies.length);
    const randomMovieId = importedMovies[randomIndex].id;
    
    console.log(`Zufällige Film-ID ausgewählt: ${randomMovieId}`);
    
    return getMovieById(randomMovieId);
    
  } catch (error) {
    console.error('Fehler beim Abrufen eines zufälligen importierten Films:', error);
    throw error;
  }
};
