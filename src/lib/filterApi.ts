
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
  if (!arr || arr.length === 0) return [];
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, Math.min(count, arr.length));
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
  
  // Validiere die Filter
  if ((!moods || moods.length === 0) && 
      (!genres || genres.length === 0) && 
      (!decades || decades.length === 0)) {
    console.log('No valid filters provided');
    return [];
  }
  
  // Build basic parameters
  let params: Record<string, any> = {
    'sort_by': 'popularity.desc',
    'vote_count.gte': '10', // Reduzierte Mindestanzahl an Stimmen für mehr Ergebnisse
    'include_adult': 'false',
    'include_video': 'false',
    'page': '1'
  };
  
  // Nur bei modernen Filmen nach deutscher Sprache filtern
  if (!decades || (decades.length > 0 && parseInt(decades[0]) >= 2000)) {
    params.with_original_language = 'de,en';
  }
  
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
      if (moodGenres.length > 0) {
        const randomMoodGenres = getRandomFromArray(moodGenres);
        genresToInclude.push(...randomMoodGenres);
      }
    });
  }
  
  // Doppelte Genres entfernen
  const uniqueGenres = [...new Set(genresToInclude)];
  
  if (uniqueGenres.length > 0) {
    params.with_genres = uniqueGenres.join(',');
  }
  
  // Jahrzehnt-Filter anwenden
  if (decades && decades.length > 0) {
    const decadeStr = decades[0]; // Wir verwenden nur das erste ausgewählte Jahrzehnt
    const decade = parseInt(decadeStr);
    
    if (!isNaN(decade)) {
      const startYear = decade;
      const endYear = decade + 9;
      
      params.primary_release_date_gte = `${startYear}-01-01`;
      params.primary_release_date_lte = `${endYear}-12-31`;
      
      console.log(`Decade filtering: ${startYear}-01-01 to ${endYear}-12-31`);
    }
  }
  
  if (rating > 0) {
    params.vote_average_gte = rating.toString();
  }
  
  console.log('API call params:', params);
  
  try {
    // First API call to get movies
    const data = await callTMDB(endpoint, params);
    
    if (!data.results || data.results.length === 0) {
      console.log('No results from initial TMDB API call, trying with fewer restrictions');
      
      // Trying with fewer restrictions
      const fallbackParams = { ...params };
      
      // Remove language restriction for older decades
      delete fallbackParams.with_original_language;
      
      // Lower the vote count threshold even more
      fallbackParams.vote_count_gte = '5';
      
      const fallbackData = await callTMDB(endpoint, fallbackParams);
      console.log(`Received ${fallbackData.results?.length || 0} results from fallback API call`);
      
      if (!fallbackData.results || fallbackData.results.length === 0 && decades && decades.length > 0) {
        // Last resort: try to get any popular movies from that decade
        const lastResortParams = {
          'sort_by': 'popularity.desc',
          'primary_release_date_gte': params.primary_release_date_gte,
          'primary_release_date_lte': params.primary_release_date_lte,
          'vote_count_gte': '3'
        };
        
        console.log('Last resort API call with params:', lastResortParams);
        const lastResortData = await callTMDB(endpoint, lastResortParams);
        
        if (!lastResortData.results || lastResortData.results.length === 0) {
          console.log('No results after all attempts');
          return [];
        }
        
        data.results = lastResortData.results;
      } else if (fallbackData.results && fallbackData.results.length > 0) {
        data.results = fallbackData.results;
      } else {
        console.log('No results after fallback query');
        return [];
      }
    }
    
    console.log(`Received ${data.results.length} results from API`);
    
    // Filter the results to ensure they match our criteria
    let filteredResults = data.results
      .filter((item: any) => {
        const hasValidMetadata = item.poster_path && item.overview && item.overview.trim() !== '';
        
        if (!hasValidMetadata) {
          return false;
        }
        
        // Additional decade check
        if (decades && decades.length > 0 && item.release_date) {
          const releaseYear = parseInt(item.release_date.split('-')[0]);
          const selectedDecade = parseInt(decades[0]);
          
          if (isNaN(releaseYear) || isNaN(selectedDecade)) {
            return false;
          }
          
          // Check if release year is in the selected decade
          const isInDecade = releaseYear >= selectedDecade && releaseYear <= (selectedDecade + 9);
          
          if (!isInDecade) {
            console.log(`Filtering out movie from year ${releaseYear} (not in decade ${selectedDecade}-${selectedDecade+9}): ${item.title}`);
            return false;
          }
        }
        
        return true;
      })
      .map((item: any) => ({
        ...item,
        media_type: 'movie'
      }));
    
    console.log(`Filtered to ${filteredResults.length} valid results after checks`);
    
    if (filteredResults.length === 0) {
      console.log('No results after filtering');
      return [];
    }
    
    // Randomize results and return up to 20
    return filteredResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
  } catch (error) {
    console.error('Error fetching movies from TMDB API:', error);
    return [];
  }
};
