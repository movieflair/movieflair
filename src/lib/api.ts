import { supabase } from '@/integrations/supabase/client';

export interface Genre {
  id: number;
  name: string;
}

export interface MovieOrShow {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  hasStream?: boolean;
  streamUrl?: string;
  hasTrailer?: boolean;
}

export interface MovieDetail extends MovieOrShow {
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  genres?: Genre[];
  tagline?: string;
  homepage?: string;
  cast?: CastMember[];
  videos?: {
    results: {
      key: string;
      name: string;
      type: string;
      site?: string;
    }[];
  };
  hasStream?: boolean;
  streamUrl?: string;
  hasTrailer?: boolean;
}

export interface FilterOptions {
  genres?: number[];
  decades?: string[];
  moods?: string[];
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  job?: string;
}

export const moodToGenres: Record<string, number[]> = {
  happy: [35, 10751, 12], // Comedy, Family, Adventure
  sad: [18, 10749], // Drama, Romance
  thrilling: [28, 53, 27], // Action, Thriller, Horror
  thoughtful: [99, 36], // Documentary, History
  relaxing: [16, 10402], // Animation, Music 
  inspiring: [18, 36], // Drama, History
  romantic: [10749], // Romance
  exciting: [28, 12, 878], // Action, Adventure, Science Fiction
  nostalgic: [36, 10751], // History, Family
  suspenseful: [9648, 53], // Mystery, Thriller
  lighthearted: [35, 10751, 16], // Comedy, Family, Animation
};

async function callTMDB(path: string, searchParams = {}) {
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { path, searchParams },
  });

  if (error) throw error;
  return data;
}

export const getGenres = async (): Promise<Genre[]> => {
  const data = await callTMDB('/genre/movie/list');
  return data.genres;
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  return data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie',
  }));
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/now_playing');
  return data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie',
    hasTrailer: true,
  }));
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  return data.results
    .map((movie: any) => ({
      ...movie,
      media_type: 'movie',
      hasStream: Math.random() > 0.5,
    }))
    .filter((movie: MovieOrShow) => movie.hasStream);
};

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`, { append_to_response: 'videos' }),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  return {
    ...movieData,
    media_type: 'movie',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    hasTrailer: videos.results?.some((v: any) => v.type === 'Trailer'),
  };
};

export const getTvShowById = async (id: number): Promise<MovieDetail> => {
  const [showData, videos, credits] = await Promise.all([
    callTMDB(`/tv/${id}`),
    callTMDB(`/tv/${id}/videos`),
    callTMDB(`/tv/${id}/credits`),
  ]);

  return {
    ...showData,
    media_type: 'tv',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    hasTrailer: videos.results?.some((v: any) => v.type === 'Trailer'),
  };
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres, decades } = filters;
  
  let params: Record<string, string> = {
    sort_by: 'popularity.desc',
  };
  
  if (genres && genres.length > 0) {
    params.with_genres = genres.join(',');
  }
  
  if (decades && decades.length > 0) {
    const decade = parseInt(decades[0]);
    params.primary_release_date_gte = `${decade}-01-01`;
    params.primary_release_date_lte = `${decade + 9}-12-31`;
  }
  
  const data = await callTMDB('/discover/movie', params);
  return data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie',
  }));
};
