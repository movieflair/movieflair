import { Genre, MovieOrShow, FilterOptions } from './types';
import { callTMDB } from './apiUtils';

export const moodToGenres: Record<string, number[]> = {
  fröhlich: [35, 10751, 12], // Comedy, Family, Adventure
  nachdenklich: [99, 36], // Documentary, History
  entspannend: [16, 10402], // Animation, Music 
  romantisch: [10749], // Romance
  spannend: [28, 53, 27], // Action, Thriller, Horror
  nostalgisch: [36, 10751], // History, Family
  inspirierend: [18, 36], // Drama, History
  dramatisch: [18], // Drama
  aufregend: [28, 12, 878], // Action, Adventure, Science Fiction
  geheimnisvoll: [9648, 53], // Mystery, Thriller
  herzerwärmend: [18, 10751, 10749], // Drama, Family, Romance
};

export const getGenres = async (): Promise<Genre[]> => {
  const data = await callTMDB('/genre/movie/list');
  return data.genres;
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres, decades, moods, mediaType = 'movie', rating = 0 } = filters;
  
  // Handle 'all' mediaType by performing both movie and TV searches
  if (mediaType === 'all') {
    const movieResults = await fetchMediaByType({ ...filters, mediaType: 'movie' });
    const tvResults = await fetchMediaByType({ ...filters, mediaType: 'tv' });
    
    // Combine and shuffle results to provide a mix of movies and shows
    const combinedResults = [...movieResults, ...tvResults];
    return shuffleArray(combinedResults);
  }
  
  // Otherwise fetch just the requested media type
  return fetchMediaByType(filters);
};

// Helper function to shuffle array (for mixing movies and TV shows)
const shuffleArray = (array: MovieOrShow[]): MovieOrShow[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper function to fetch either movies or TV shows based on filters
const fetchMediaByType = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres, decades, moods, mediaType = 'movie', rating = 0 } = filters;
  
  const endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
  
  let params: Record<string, string> = {
    sort_by: 'popularity.desc',
    'vote_count.gte': '20', // Nur Medien mit einer Mindestanzahl an Bewertungen
  };
  
  // Genres zusammenstellen (direkt ausgewählte und aus Moods abgeleitete)
  let genresToInclude: number[] = [];
  
  // Direkt ausgewählte Genres
  if (genres && genres.length > 0) {
    genresToInclude = [...genresToInclude, ...genres];
  }
  
  // Genres basierend auf ausgewählten Stimmungen hinzufügen
  if (moods && moods.length > 0) {
    moods.forEach(mood => {
      const moodGenres = moodToGenres[mood] || [];
      genresToInclude = [...genresToInclude, ...moodGenres];
    });
  }
  
  // Doppelte Genres entfernen
  genresToInclude = [...new Set(genresToInclude)];
  
  if (genresToInclude.length > 0) {
    params.with_genres = genresToInclude.join(',');
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
  
  // Nur Medien mit Beschreibung und Cover zurückgeben
  return data.results
    .filter((item: any) => item.poster_path && item.overview && item.overview.trim() !== '')
    .map((item: any) => ({
      ...item,
      media_type: mediaType === 'movie' ? 'movie' : 'tv',
    }));
};
