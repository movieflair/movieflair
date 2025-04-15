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
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  hasStream?: boolean;
  streamUrl?: string;
  hasTrailer?: boolean;
  trailerUrl?: string;
  isFreeMovie?: boolean;
  isNewTrailer?: boolean;
}

export interface MovieDetail extends MovieOrShow {
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  genres?: Genre[];
  tagline?: string;
  homepage?: string;
  cast?: CastMember[];
  crew?: CastMember[];
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
  trailerUrl?: string;
  isFreeMovie?: boolean;
  isNewTrailer?: boolean;
  vote_count?: number;
}

export interface FilterOptions {
  genres?: number[];
  decades?: string[];
  moods?: string[];
  mediaType?: 'movie' | 'tv' | 'all';
  rating?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  job?: string;
}

export interface VisitorStat {
  date: string;
  count: number;
  page: string;
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
  const params = {
    ...searchParams,
    language: 'de-DE'
  };
  
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { path, searchParams: params },
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
  
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/movie', { query });
  
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/now_playing');
  const savedSettings = await getAdminMovieSettings();
  
  const movies = data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
  
  const trailerMovies = movies.filter(movie => movie.isNewTrailer === true);
  console.log('Trailer movies filtered:', trailerMovies);
  return trailerMovies;
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  const savedSettings = await getAdminMovieSettings();
  
  const movies = data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
  
  return movies.filter(movie => movie.isFreeMovie === true);
};

const getAdminMovieSettings = async () => {
  const savedMoviesJson = localStorage.getItem('adminMovies');
  if (!savedMoviesJson) return {};
  
  try {
    const savedMovies = JSON.parse(savedMoviesJson);
    return savedMovies.reduce((acc: Record<number, any>, movie: MovieOrShow) => {
      if (movie.id) {
        acc[movie.id] = movie;
      }
      return acc;
    }, {});
  } catch (e) {
    console.error('Error parsing saved movies:', e);
    return {};
  }
};

const getAdminTvShowSettings = async () => {
  const savedShowsJson = localStorage.getItem('adminShows');
  if (!savedShowsJson) return {};
  
  try {
    const savedShows = JSON.parse(savedShowsJson);
    return savedShows.reduce((acc: Record<number, any>, show: MovieOrShow) => {
      if (show.id) {
        acc[show.id] = show;
      }
      return acc;
    }, {});
  } catch (e) {
    console.error('Error parsing saved shows:', e);
    return {};
  }
};

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`, { append_to_response: 'videos' }),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  const savedMoviesJson = localStorage.getItem('adminMovies');
  let adminSettings: Record<string, any> = {};

  if (savedMoviesJson) {
    try {
      const savedMovies = JSON.parse(savedMoviesJson);
      const savedMovie = savedMovies.find((m: any) => m.id === id);
      if (savedMovie) {
        adminSettings = {
          hasStream: savedMovie.hasStream || false,
          streamUrl: savedMovie.streamUrl || '',
          hasTrailer: savedMovie.hasTrailer || false,
          trailerUrl: savedMovie.trailerUrl || '',
          isFreeMovie: savedMovie.isFreeMovie || false,
          isNewTrailer: savedMovie.isNewTrailer || false,
        };
      }
    } catch (e) {
      console.error('Error parsing saved movies:', e);
    }
  }

  return {
    ...movieData,
    media_type: 'movie',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: adminSettings.hasTrailer ?? videos.results?.some((v: any) => v.type === 'Trailer'),
    ...adminSettings,
  };
};

export const getTvShowById = async (id: number): Promise<MovieDetail> => {
  const [showData, videos, credits] = await Promise.all([
    callTMDB(`/tv/${id}`),
    callTMDB(`/tv/${id}/videos`),
    callTMDB(`/tv/${id}/credits`),
  ]);

  const savedShowsJson = localStorage.getItem('adminShows');
  let adminSettings: Record<string, any> = {};

  if (savedShowsJson) {
    try {
      const savedShows = JSON.parse(savedShowsJson);
      const savedShow = savedShows.find((s: any) => s.id === id);
      if (savedShow) {
        adminSettings = {
          hasStream: savedShow.hasStream || false,
          streamUrl: savedShow.streamUrl || '',
          hasTrailer: savedShow.hasTrailer || false,
          trailerUrl: savedShow.trailerUrl || '',
        };
      }
    } catch (e) {
      console.error('Error parsing saved shows:', e);
    }
  }

  return {
    ...showData,
    media_type: 'tv',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: adminSettings.hasTrailer ?? videos.results?.some((v: any) => v.type === 'Trailer'),
    ...adminSettings,
  };
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres, decades, mediaType = 'movie', rating = 0 } = filters;
  
  const endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
  
  let params: Record<string, string> = {
    sort_by: 'popularity.desc',
  };
  
  if (genres && genres.length > 0) {
    params.with_genres = genres.join(',');
  }
  
  if (decades && decades.length > 0) {
    const decade = parseInt(decades[0]);
    if (mediaType === 'movie') {
      params.primary_release_date_gte = `${decade}-01-01`;
      params.primary_release_date_lte = `${decade + 9}-12-31`;
    } else {
      params.first_air_date_gte = `${decade}-01-01`;
      params.first_air_date_lte = `${decade + 9}-12-31`;
    }
  }
  
  if (rating > 0) {
    params.vote_average_gte = rating.toString();
  }
  
  const data = await callTMDB(endpoint, params);
  
  const savedMovieSettings = await getAdminMovieSettings();
  const savedTvSettings = await getAdminTvShowSettings();
  
  return data.results.map((item: any) => {
    const isMovie = mediaType === 'all' ? !item.first_air_date : mediaType === 'movie';
    const itemId = item.id;
    const savedSettings = isMovie ? savedMovieSettings[itemId] || {} : savedTvSettings[itemId] || {};
    
    return {
      ...item,
      media_type: isMovie ? 'movie' : 'tv',
      hasStream: savedSettings.hasStream || false,
      streamUrl: savedSettings.streamUrl || '',
      hasTrailer: savedSettings.hasTrailer || false,
      trailerUrl: savedSettings.trailerUrl || '',
      isFreeMovie: isMovie ? savedSettings.isFreeMovie || false : false,
      isNewTrailer: isMovie ? savedSettings.isNewTrailer || false : false,
    };
  });
};

export const getSimilarMovies = async (movieId: number): Promise<MovieOrShow[]> => {
  const data = await callTMDB(`/movie/${movieId}/similar`);
  
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const getPopularTvShows = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/tv/popular');
  
  const savedSettings = await getAdminTvShowSettings();
  
  return data.results.map((show: any) => {
    const savedShow = savedSettings[show.id] || {};
    return {
      ...show,
      media_type: 'tv',
      hasStream: savedShow.hasStream || false,
      streamUrl: savedShow.streamUrl || '',
      hasTrailer: savedShow.hasTrailer || false,
      trailerUrl: savedShow.trailerUrl || '',
    };
  });
};

export const searchTvShows = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/tv', { query });
  
  const savedSettings = await getAdminTvShowSettings();
  
  return data.results.map((show: any) => {
    const savedShow = savedSettings[show.id] || {};
    return {
      ...show,
      media_type: 'tv',
      hasStream: savedShow.hasStream || false,
      streamUrl: savedShow.streamUrl || '',
      hasTrailer: savedShow.hasTrailer || false,
      trailerUrl: savedShow.trailerUrl || '',
    };
  });
};

export const trackPageVisit = async (page: string) => {
  const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
  if (isAdmin) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const visitsJson = localStorage.getItem('pageVisits');
    let visits: VisitorStat[] = [];
    
    if (visitsJson) {
      visits = JSON.parse(visitsJson);
    }
    
    const existingIndex = visits.findIndex(v => v.date === today && v.page === page);
    
    if (existingIndex >= 0) {
      visits[existingIndex].count += 1;
    } else {
      visits.push({ date: today, count: 1, page });
    }
    
    localStorage.setItem('pageVisits', JSON.stringify(visits));
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
};

export const getVisitorStats = (): VisitorStat[] => {
  try {
    const visitsJson = localStorage.getItem('pageVisits');
    if (!visitsJson) return [];
    return JSON.parse(visitsJson);
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return [];
  }
};

export const getRandomMovie = async (): Promise<MovieDetail> => {
  const data = await callTMDB('/movie/popular', { page: Math.floor(Math.random() * 5) + 1 });
  
  const randomIndex = Math.floor(Math.random() * data.results.length);
  const randomMovieBasic = data.results[randomIndex];
  
  const movieDetail = await getMovieById(randomMovieBasic.id);
  
  return movieDetail;
};
