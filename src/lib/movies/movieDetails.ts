
import { MovieDetail } from '../types';
import { callTMDB } from '../apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { convertToYouTubeEmbed, isYouTubeUrl } from '@/utils/videoUtils';

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  // First check if movie exists in our database with custom settings
  const { data: adminMovie, error: adminError } = await supabase
    .from('admin_movies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (adminError) {
    console.error('Error fetching movie from Supabase:', adminError);
  }

  // Then fetch the movie data from TMDB API
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  // If we have admin settings, use those values
  if (adminMovie) {
    console.log('Found movie in admin_movies table:', adminMovie);
    const streamUrl = adminMovie.streamurl && isYouTubeUrl(adminMovie.streamurl) 
      ? convertToYouTubeEmbed(adminMovie.streamurl)
      : adminMovie.streamurl;

    return {
      ...movieData,
      media_type: 'movie',
      videos: { results: videos.results },
      cast: credits.cast?.slice(0, 10),
      crew: credits.crew,
      hasTrailer: adminMovie.hastrailer || videos.results?.some((v: any) => v.type === 'Trailer'),
      hasStream: adminMovie.hasstream || false,
      streamUrl: streamUrl || '',
      trailerUrl: adminMovie.trailerurl || '',
      isFreeMovie: adminMovie.isfreemovie || false,
      isNewTrailer: adminMovie.isnewtrailer || false,
    };
  }

  // Return data from TMDB API only
  return {
    ...movieData,
    media_type: 'movie',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: videos.results?.some((v: any) => v.type === 'Trailer'),
    hasStream: false,
    streamUrl: '',
    trailerUrl: '',
    isFreeMovie: false,
    isNewTrailer: false,
  };
};

export const getSimilarMovies = async (id: number): Promise<MovieDetail[]> => {
  const data = await callTMDB(`/movie/${id}/similar`);
  return data.results
    .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
    .map((movie: any) => ({
      ...movie,
      media_type: 'movie'
    }));
};
