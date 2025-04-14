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
  isFreeMovie?: boolean;
  isNewTrailer?: boolean;
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
  // Füge immer language=de-DE zu den Suchanfragen hinzu
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
  
  // Lade gespeicherte Filmeinstellungen
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/movie', { query });
  
  // Lade gespeicherte Filmeinstellungen
  const savedSettings = await getAdminMovieSettings();
  
  return data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/now_playing');
  const savedSettings = await getAdminMovieSettings();
  
  // Nur Filme zurückgeben, die explizit als neue Trailer markiert wurden
  const movies = data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasTrailer: savedMovie.hasTrailer || false,
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
  
  return movies.filter(movie => savedSettings[movie.id]?.isNewTrailer === true);
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  const savedSettings = await getAdminMovieSettings();
  
  // Nur Filme zurückgeben, die explizit als kostenlos markiert wurden
  const movies = data.results.map((movie: any) => {
    const savedMovie = savedSettings[movie.id] || {};
    return {
      ...movie,
      media_type: 'movie',
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      hasTrailer: savedMovie.hasTrailer || false,
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
    };
  });
  
  return movies.filter(movie => savedSettings[movie.id]?.isFreeMovie === true);
};

// Hilfsfunktion zum Laden gespeicherter Filmeinstellungen
const getAdminMovieSettings = async () => {
  const savedMoviesJson = localStorage.getItem('adminMovies');
  if (!savedMoviesJson) return {};
  
  try {
    const savedMovies = JSON.parse(savedMoviesJson);
    // Konvertiere Array in ein Objekt mit Film-ID als Schlüssel
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

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`, { append_to_response: 'videos' }),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  // Überprüfen, ob der Film in den admin Einstellungen gespeichert ist
  const savedMoviesJson = localStorage.getItem('adminMovies');
  let adminSettings: Record<string, any> = {}; // Initialize with an empty object with defined type
  
  if (savedMoviesJson) {
    try {
      const savedMovies = JSON.parse(savedMoviesJson);
      const savedMovie = savedMovies.find((m: any) => m.id === id);
      if (savedMovie) {
        adminSettings = {
          hasStream: savedMovie.hasStream || false,
          streamUrl: savedMovie.streamUrl || '',
          hasTrailer: savedMovie.hasTrailer || false,
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

  return {
    ...showData,
    media_type: 'tv',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: videos.results?.some((v: any) => v.type === 'Trailer'),
  };
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres, decades, mediaType = 'movie', rating = 0 } = filters;
  
  // Entscheide, ob nach Filmen, Serien oder beiden gesucht wird
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
  return data.results.map((item: any) => ({
    ...item,
    media_type: mediaType === 'all' ? (item.first_air_date ? 'tv' : 'movie') : mediaType,
  }));
};

export const getSimilarMovies = async (movieId: number): Promise<MovieOrShow[]> => {
  const data = await callTMDB(`/movie/${movieId}/similar`);
  return data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie',
  }));
};

export const getPopularTvShows = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/tv/popular');
  
  return data.results.map((show: any) => ({
    ...show,
    media_type: 'tv',
  }));
};

export const searchTvShows = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/tv', { query });
  
  return data.results.map((show: any) => ({
    ...show,
    media_type: 'tv',
  }));
};

export const trackPageVisit = async (page: string) => {
  // Prüfen, ob der Benutzer ein Admin ist - keine Aufrufe von Admins tracken
  const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
  if (isAdmin) return;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD Format
  
  try {
    // Bestehende Daten laden
    const visitsJson = localStorage.getItem('pageVisits');
    let visits: VisitorStat[] = [];
    
    if (visitsJson) {
      visits = JSON.parse(visitsJson);
    }
    
    // Suchen, ob für heute und diese Seite bereits ein Eintrag existiert
    const existingIndex = visits.findIndex(v => v.date === today && v.page === page);
    
    if (existingIndex >= 0) {
      // Inkrementieren des bestehenden Eintrags
      visits[existingIndex].count += 1;
    } else {
      // Neuen Eintrag hinzufügen
      visits.push({ date: today, count: 1, page });
    }
    
    // Daten speichern
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
