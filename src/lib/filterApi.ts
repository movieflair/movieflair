
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
  
  let params: Record<string, string> = {
    'sort_by': 'popularity.desc',
    'vote_count.gte': '50', // Mindestanzahl an Bewertungen
    'include_adult': 'false',
    'include_video': 'false',
    'with_original_language': 'de,en', // Deutsch und Englisch
    'page': '1',
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
  
  // STRIKTE Jahrzehnt-Filter anwenden
  if (decades && decades.length > 0) {
    const decadeStr = decades[0]; // Wir verwenden nur das erste ausgewählte Jahrzehnt
    const decade = parseInt(decadeStr);
    
    if (!isNaN(decade)) {
      const startYear = decade;
      const endYear = decade + 9;
      
      // Verwende exakte Jahrzehnt-Filterung mit Anfangs- und Enddatum
      params.primary_release_date_gte = `${startYear}-01-01`;
      params.primary_release_date_lte = `${endYear}-12-31`;
      
      console.log(`Strict decade filtering: ${startYear}-01-01 to ${endYear}-12-31`);
    }
  }
  
  if (rating > 0) {
    params['vote_average.gte'] = rating.toString();
  }
  
  console.log('API call params:', params);
  
  try {
    // Direkte API-Anfrage an TMDB über unsere Supabase-Funktion
    const data = await callTMDB(endpoint, params);
    console.log(`Received ${data.results?.length || 0} results from API`, data);
    
    if (!data.results || data.results.length === 0) {
      console.log('No results from TMDB API');
      return [];
    }
    
    // Überprüfe die Jahrzehnt-Filterung für alle Ergebnisse und filtere die falschen heraus
    let filteredResults = data.results
      .filter((item: any) => {
        // Überprüfe, ob das Item eine gültige Beschreibung und ein Poster hat
        const hasValidMetadata = item.poster_path && item.overview && item.overview.trim() !== '';
        
        // Wenn keine Jahrzehnt-Filterung aktiv ist, prüfe nur Metadaten
        if (!decades || decades.length === 0) {
          return hasValidMetadata;
        }
        
        // Wenn Jahrzehnt-Filterung aktiv ist, überprüfe auch das Veröffentlichungsdatum
        if (item.release_date) {
          const releaseYear = parseInt(item.release_date.split('-')[0]);
          const selectedDecade = parseInt(decades[0]);
          
          // Überprüfe, ob das Veröffentlichungsjahr im ausgewählten Jahrzehnt liegt
          const isInDecade = releaseYear >= selectedDecade && releaseYear <= (selectedDecade + 9);
          
          if (!isInDecade) {
            console.log(`Filtering out movie from year ${releaseYear} (not in decade ${selectedDecade}-${selectedDecade+9})`, item.title);
          }
          
          return hasValidMetadata && isInDecade;
        }
        
        return false;
      })
      .map((item: any) => ({
        ...item,
        media_type: 'movie'
      }));
    
    console.log(`Filtered to ${filteredResults.length} valid results after decade check`);
    
    if (filteredResults.length === 0) {
      console.log('No results found after filtering');
      return [];
    }
    
    // Ergebnisse zufällig mischen und maximal 20 zurückgeben
    return filteredResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
  } catch (error) {
    console.error('Error fetching movies from TMDB API:', error);
    return [];
  }
};
