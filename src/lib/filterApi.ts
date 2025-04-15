
import { Genre, MovieOrShow, FilterOptions } from './types';
import { callTMDB } from './apiUtils';

// Mapping von Stimmungen zu Genres
export const moodToGenres: Record<string, number[]> = {
  'fröhlich': [35, 10751], // Comedy, Family
  'nachdenklich': [18, 99], // Drama, Documentary
  'entspannend': [10749, 10751], // Romance, Family
  'romantisch': [10749, 18], // Romance, Drama
  'spannend': [53, 28], // Thriller, Action
  'nostalgisch': [36, 10402, 18], // History, Music, Drama
  'inspirierend': [18, 99], // Drama, Documentary
  'dramatisch': [18, 53], // Drama, Thriller
  'aufregend': [28, 12], // Action, Adventure
  'geheimnisvoll': [9648, 80], // Mystery, Crime
  'herzerwärmend': [10751, 16] // Family, Animation
};

// API-Funktion zum Abrufen der Genres
export const getGenres = async (): Promise<Genre[]> => {
  const data = await callTMDB('/genre/movie/list');
  return data.genres;
};

// Hauptfunktion zur Filterung von Filmen
export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  console.log('Filter options received:', filters);
  
  // Wenn keine Filter gesetzt sind, leere Liste zurückgeben
  if (!filters || ((!filters.genres || filters.genres.length === 0) && 
      (!filters.moods || filters.moods.length === 0) && 
      (!filters.decades || filters.decades.length === 0))) {
    console.log('No valid filters provided');
    return [];
  }
  
  return fetchMoviesByFilters(filters);
};

// Hilfsfunktion zum Abrufen von Filmen basierend auf Filtern
const fetchMoviesByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const { genres = [], decades = [], moods = [], rating = 0 } = filters;
  console.log(`Fetching movies with filters - genres: ${genres}, decades: ${decades}, moods: ${moods}, rating: ${rating}`);
  
  try {
    // Grundlegende Parameter für die API-Anfrage
    let params: Record<string, any> = {
      'sort_by': 'popularity.desc',
      'vote_count.gte': '5', // Reduzierte Mindestanzahl an Stimmen
      'include_adult': 'false',
      'include_video': 'false',
      'page': '1',
    };
    
    // Sammeln Sie alle Genres (aus direkt ausgewählten und Stimmungen)
    let allGenres: number[] = [...genres];
    
    // Füge Genres basierend auf Stimmungen hinzu
    if (moods.length > 0) {
      moods.forEach(mood => {
        const moodGenres = moodToGenres[mood] || [];
        if (moodGenres.length > 0) {
          allGenres.push(...moodGenres);
        }
      });
    }
    
    // Entferne Duplikate
    const uniqueGenres = [...new Set(allGenres)];
    
    if (uniqueGenres.length > 0) {
      params.with_genres = uniqueGenres.join(',');
    }
    
    // Mindestbewertung
    if (rating > 0) {
      params.vote_average_gte = rating.toString();
    }
    
    // Jahrzehnt-Filter anwenden
    if (decades.length > 0) {
      // Wir verarbeiten jeden Jahrzehnt einzeln und sammeln die Ergebnisse
      let allResults: MovieOrShow[] = [];
      
      for (const decadeStr of decades) {
        const decade = parseInt(decadeStr);
        if (!isNaN(decade)) {
          const startYear = decade;
          const endYear = decade + 9;
          
          console.log(`Searching decade ${startYear}-${endYear}`);
          
          const decadeParams = {
            ...params,
            'primary_release_date.gte': `${startYear}-01-01`,
            'primary_release_date.lte': `${endYear}-12-31`
          };
          
          // API-Aufruf für das aktuelle Jahrzehnt
          const data = await callTMDB('/discover/movie', decadeParams);
          
          if (data.results && data.results.length > 0) {
            console.log(`Found ${data.results.length} movies for decade ${startYear}-${endYear}`);
            
            // Filtern Sie Ergebnisse, um sicherzustellen, dass sie gültig sind
            const validResults = data.results
              .filter((item: any) => item.poster_path && item.overview && item.overview.trim() !== '')
              .map((item: any) => ({
                ...item,
                media_type: 'movie'
              }));
            
            allResults.push(...validResults);
          } else {
            console.log(`No results for decade ${startYear}-${endYear}, trying fallback`);
            
            // Fallback mit weniger Einschränkungen
            const fallbackParams = {
              ...decadeParams,
              'vote_count.gte': '3'
            };
            
            // Für ältere Filme sind weniger Einschränkungen nötig, aber wir müssen
            // mit den Parametern arbeiten, die im Objekt tatsächlich existieren
            // Daher kein Versuch, nicht existierende Eigenschaften zu löschen
            
            const fallbackData = await callTMDB('/discover/movie', fallbackParams);
            
            if (fallbackData.results && fallbackData.results.length > 0) {
              console.log(`Fallback found ${fallbackData.results.length} movies for decade ${startYear}-${endYear}`);
              
              const validFallbackResults = fallbackData.results
                .filter((item: any) => item.poster_path)
                .map((item: any) => ({
                  ...item,
                  media_type: 'movie'
                }));
              
              allResults.push(...validFallbackResults);
            }
          }
        }
      }
      
      // Mischen Sie die Ergebnisse, um Vielfalt zu bieten
      const shuffledResults = allResults.sort(() => Math.random() - 0.5);
      
      // Reduzieren Sie auf maximal 20 Ergebnisse
      return shuffledResults.slice(0, 20);
    } else {
      // Wenn kein Jahrzehnt ausgewählt wurde, normalen API-Aufruf durchführen
      const data = await callTMDB('/discover/movie', params);
      
      if (!data.results || data.results.length === 0) {
        console.log('No results from initial API call, trying with fewer restrictions');
        
        // Fallback mit weniger Einschränkungen
        params.vote_count_gte = '3';
        const fallbackData = await callTMDB('/discover/movie', params);
        
        if (!fallbackData.results || fallbackData.results.length === 0) {
          return [];
        }
        
        return fallbackData.results
          .filter((item: any) => item.poster_path)
          .map((item: any) => ({
            ...item,
            media_type: 'movie'
          }))
          .slice(0, 20);
      }
      
      return data.results
        .filter((item: any) => item.poster_path && item.overview && item.overview.trim() !== '')
        .map((item: any) => ({
          ...item,
          media_type: 'movie'
        }))
        .slice(0, 20);
    }
  } catch (error) {
    console.error('Error fetching movies by filters:', error);
    return [];
  }
};
