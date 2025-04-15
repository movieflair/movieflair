
import { Genre, MovieOrShow, FilterOptions } from './types';
import { callTMDB } from './apiUtils';

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

export const getGenres = async (): Promise<Genre[]> => {
  const data = await callTMDB('/genre/movie/list');
  return data.genres;
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
  
  return data.results.map((item: any) => ({
    ...item,
    media_type: mediaType === 'movie' ? 'movie' : 'tv',
  }));
};

