
import { Genre, MovieOrShow, FilterOptions } from './types';
import { callTMDB } from './apiUtils';

export const moodToGenres: Record<string, number[]> = {
  fröhlich: [35, 10751], // Comedy, Family
  nachdenklich: [18, 99], // Drama, Documentary
  entspannend: [10749, 10751], // Romance, Family
  romantisch: [10749, 18], // Romance, Drama
  spannend: [53, 28], // Thriller, Action
  nostalgisch: [36, 10402, 18], // History, Music, Drama
  inspirierend: [18, 99], // Drama, Documentary
  dramatisch: [18, 53], // Drama, Thriller
  aufregend: [28, 12], // Action, Adventure
  geheimnisvoll: [9648, 80], // Mystery, Crime
  herzerwärmend: [10751, 16] // Family, Animation
};

// Helper function to get random genres from an array
const getRandomFromArray = (arr: number[], count = 2): number[] => {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
};

export const getGenres = async (): Promise<Genre[]> => {
  const data = await callTMDB('/genre/movie/list');
  return data.genres;
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  console.log('Filter options received:', filters);
  return fetchMediaByType(filters);
};

// Helper function to fetch movies based on filters
const fetchMediaByType = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres, decades, moods, rating = 0 } = filters;
  const endpoint = '/discover/movie';
  
  let params: Record<string, string> = {
    'sort_by': 'popularity.desc',
    'vote_count.gte': '50', // Mindestanzahl an Bewertungen
    'language': 'de-DE'
  };
  
  // Genres zusammenstellen (direkt ausgewählte und zufällige aus Moods)
  let genresToInclude: number[] = [];
  
  // Direkt ausgewählte Genres
  if (genres && genres.length > 0) {
    genresToInclude.push(...genres);
  }
  
  // Zufällige Genres basierend auf Stimmungen hinzufügen
  if (moods && moods.length > 0) {
    moods.forEach(mood => {
      const moodGenres = moodToGenres[mood] || [];
      const randomMoodGenres = getRandomFromArray(moodGenres);
      genresToInclude.push(...randomMoodGenres);
    });
  }
  
  // Doppelte Genres entfernen
  const uniqueGenres = [...new Set(genresToInclude)];
  
  if (uniqueGenres.length > 0) {
    params.with_genres = uniqueGenres.join(',');
  }
  
  // Exakte Jahrzehnt-Filter anwenden
  if (decades && decades.length > 0) {
    const decade = parseInt(decades[0]);
    const startYear = decade;
    const endYear = decade + 9;
    
    params.primary_release_date_gte = `${startYear}-01-01`;
    params.primary_release_date_lte = `${endYear}-12-31`;
    
    console.log(`Filtering by decade: ${startYear}-${endYear}`);
  }
  
  if (rating > 0) {
    params['vote_average.gte'] = rating.toString();
  }
  
  console.log('API call params:', params);
  
  const data = await callTMDB(endpoint, params);
  console.log(`Received ${data.results.length} results from API`);
  
  // Nur Medien mit Beschreibung und Cover zurückgeben
  const filteredResults = data.results
    .filter((item: any) => item.poster_path && item.overview && item.overview.trim() !== '')
    .map((item: any) => ({
      ...item,
      media_type: 'movie'
    }));
    
  // Ergebnisse zufällig mischen und maximal 20 zurückgeben
  return filteredResults
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);
};
