
import axios from 'axios';

// This is a placeholder for the TMDB API key
// In a production environment, this should be stored securely
const API_KEY = 'YOUR_TMDB_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

export interface MovieOrShow {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetail extends MovieOrShow {
  genres: Genre[];
  runtime?: number;
  tagline?: string;
  status: string;
  homepage?: string;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
}

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const response = await api.get(`/movie/${id}?append_to_response=videos`);
  return { ...response.data, media_type: 'movie' };
};

export const getTvShowById = async (id: number): Promise<MovieDetail> => {
  const response = await api.get(`/tv/${id}?append_to_response=videos`);
  return { ...response.data, media_type: 'tv' };
};

export const getGenres = async (): Promise<Genre[]> => {
  const movieGenres = await api.get('/genre/movie/list');
  const tvGenres = await api.get('/genre/tv/list');
  
  // Combine and deduplicate genres
  const combinedGenres = [
    ...movieGenres.data.genres,
    ...tvGenres.data.genres
  ];
  
  return Array.from(
    new Map(combinedGenres.map(genre => [genre.id, genre])).values()
  );
};

export interface FilterOptions {
  mood?: string;
  genres?: number[];
  decade?: string;
}

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow> => {
  // Start with a trending list and filter from there
  const trendingResponse = await api.get('/trending/all/week');
  let results = trendingResponse.data.results as MovieOrShow[];
  
  // Apply genre filter if specified
  if (filters.genres && filters.genres.length > 0) {
    results = results.filter((item) => 
      item.genre_ids.some(genreId => filters.genres?.includes(genreId))
    );
  }
  
  // Apply decade filter
  if (filters.decade) {
    const startYear = parseInt(filters.decade);
    const endYear = startYear + 9;
    
    results = results.filter((item) => {
      const date = item.release_date || item.first_air_date;
      if (!date) return false;
      
      const year = parseInt(date.split('-')[0]);
      return year >= startYear && year <= endYear;
    });
  }
  
  // If we have results after filtering, return a random one
  if (results.length > 0) {
    const randomIndex = Math.floor(Math.random() * results.length);
    return results[randomIndex];
  }
  
  // If no results match all filters, return a random trending item
  const randomIndex = Math.floor(Math.random() * trendingResponse.data.results.length);
  return trendingResponse.data.results[randomIndex];
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  const response = await api.get('/movie/popular');
  return response.data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie',
  }));
};

export const getPopularTvShows = async (): Promise<MovieOrShow[]> => {
  const response = await api.get('/tv/popular');
  return response.data.results.map((show: any) => ({
    ...show,
    media_type: 'tv',
  }));
};

// Mood mapping to genres - this is a simplified example
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

export default api;
