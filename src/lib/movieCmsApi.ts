import { supabase } from '@/integrations/supabase/client';
import { MovieOrShow, MovieDetail } from './types';
import { uploadMovieImage } from './storage';

/**
 * Fetch a movie from TMDB by ID
 */
export const fetchMovieFromTMDB = async (movieId: number): Promise<MovieDetail | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-admin', {
      body: { action: 'getById', movieId },
    });

    if (error) {
      console.error('Error fetching movie from TMDB:', error);
      return null;
    }

    return data as MovieDetail;
  } catch (error) {
    console.error('Error fetching movie from TMDB:', error);
    return null;
  }
};

/**
 * Search for movies on TMDB
 */
export const searchTMDBMovies = async (query: string, page = 1): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-admin', {
      body: { action: 'search', searchQuery: query, page },
    });

    if (error) {
      console.error('Error searching TMDB:', error);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
};

/**
 * Get popular movies from TMDB
 */
export const getPopularTMDBMovies = async (page = 1): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-admin', {
      body: { action: 'getPopular', page },
    });

    if (error) {
      console.error('Error getting popular movies from TMDB:', error);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error getting popular movies from TMDB:', error);
    return [];
  }
};

/**
 * Download image from URL to local storage
 */
export const downloadImageToStorage = async (
  imageUrl: string,
  type: 'poster' | 'backdrop',
  movieId: number
): Promise<string | null> => {
  try {
    // For TMDB URLs, add the base URL if it's a relative path
    let fullUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      fullUrl = `https://image.tmdb.org/t/p/original${imageUrl}`;
    }
    
    // Fetch the image
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Convert to blob
    const imageBlob = await response.blob();
    
    // Convert blob to File for our upload function
    const file = new File([imageBlob], `${movieId}_${type}.jpg`, { type: 'image/jpeg' });
    
    // Upload to our storage
    return uploadMovieImage(file, type, movieId);
  } catch (error) {
    console.error(`Error downloading ${type} image:`, error);
    return null;
  }
};

/**
 * Import a movie from TMDB to our database
 */
export const importMovieFromTMDB = async (movieId: number): Promise<boolean> => {
  try {
    // First check if movie already exists
    const { data: existingMovie } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movieId)
      .maybeSingle();
      
    if (existingMovie) {
      console.log(`Movie ${movieId} already exists in database`);
      return true;
    }
    
    // Fetch the movie details from TMDB
    const movieDetails = await fetchMovieFromTMDB(movieId);
    if (!movieDetails) {
      return false;
    }
    
    // Download and store images locally
    let posterPath = null;
    let backdropPath = null;
    
    if (movieDetails.poster_path) {
      posterPath = await downloadImageToStorage(
        movieDetails.poster_path,
        'poster',
        movieDetails.id
      );
    }
    
    if (movieDetails.backdrop_path) {
      backdropPath = await downloadImageToStorage(
        movieDetails.backdrop_path,
        'backdrop',
        movieDetails.id
      );
    }
    
    // Prepare trailer URL if available
    const trailer = movieDetails.videos?.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    const trailerUrl = trailer 
      ? `https://www.youtube.com/embed/${trailer.key}` 
      : '';
    
    // Insert the movie into our database
    const { error } = await supabase.from('admin_movies').insert({
      id: movieDetails.id,
      title: movieDetails.title || '',
      overview: movieDetails.overview || '',
      poster_path: posterPath || movieDetails.poster_path || '',
      backdrop_path: backdropPath || movieDetails.backdrop_path || '',
      release_date: movieDetails.release_date || '',
      vote_average: movieDetails.vote_average || 0,
      vote_count: movieDetails.vote_count || 0,
      popularity: movieDetails.popularity || 0,
      media_type: 'movie',
      hastrailer: !!trailerUrl,
      trailerurl: trailerUrl,
      hasstream: false,
      streamurl: '',
      isfreemovie: false,
      isnewtrailer: false
    });
    
    if (error) {
      console.error('Error importing movie to database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error importing movie:', error);
    return false;
  }
};

/**
 * Get all movies from our database
 */
export const getAllMovies = async (): Promise<MovieOrShow[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
    
    return (data || []).map(movie => ({
      ...movie,
      genre_ids: [], // Add an empty array for genre_ids
      media_type: 'movie' as const,
      hasStream: movie.hasstream,
      hasTrailer: movie.hastrailer,
      streamUrl: movie.streamurl,
      trailerUrl: movie.trailerurl,
      isFreeMovie: movie.isfreemovie,
      isNewTrailer: movie.isnewtrailer,
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

/**
 * Get a movie by ID from our database
 */
export const getMovieById = async (id: number): Promise<MovieOrShow | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching movie:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      ...data,
      genre_ids: [], // Add an empty array for genre_ids
      media_type: 'movie' as const,
      hasStream: data.hasstream,
      hasTrailer: data.hastrailer,
      streamUrl: data.streamurl,
      trailerUrl: data.trailerurl,
      isFreeMovie: data.isfreemovie,
      isNewTrailer: data.isnewtrailer,
    };
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
};

/**
 * Update a movie in our database
 */
export const updateMovie = async (movie: Partial<MovieOrShow> & { id: number }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .update(movie)
      .eq('id', movie.id);
      
    if (error) {
      console.error('Error updating movie:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating movie:', error);
    return false;
  }
};

/**
 * Delete a movie from our database
 */
export const deleteMovie = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting movie:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting movie:', error);
    return false;
  }
};
