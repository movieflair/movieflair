
import { Genre, MovieOrShow, FilterOptions } from './types';
import { callTMDB } from './apiUtils';
import { supabase } from '@/integrations/supabase/client';

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
    
    // Holen wir uns alle importierten Filme aus der Datenbank
    let query = supabase
      .from('admin_movies')
      .select('*');
    
    // Mindestbewertung filtern
    if (rating > 0) {
      query = query.gte('vote_average', rating);
    }
    
    // Filme nach Genres filtern (in voller Datenbank nicht möglich, werden wir später manuell filtern)
    
    // Filme nach Jahrzehnten filtern
    if (decades.length > 0) {
      // Erstelle eine Liste von Jahrzehnt-Bedingungen
      const decadeConditions = decades.map(decadeStr => {
        const decade = parseInt(decadeStr);
        if (!isNaN(decade)) {
          const startYear = decade;
          const endYear = decade + 9;
          return `(release_date >= '${startYear}' AND release_date <= '${endYear}')`;
        }
        return null;
      }).filter(Boolean);
      
      // Wenn wir gültige Jahrzehnt-Bedingungen haben, fügen wir sie zur Abfrage hinzu
      if (decadeConditions.length > 0) {
        // In Supabase können wir nicht direkt mit OR filtern, 
        // daher müssen wir die Jahrzehnte einzeln abfragen und die Ergebnisse zusammenführen
        const decadeResults = await Promise.all(
          decades.map(async (decadeStr) => {
            const decade = parseInt(decadeStr);
            if (!isNaN(decade)) {
              const startYear = decade.toString();
              const endYear = (decade + 9).toString();
              
              const { data, error } = await supabase
                .from('admin_movies')
                .select('*')
                .gte('release_date', `${startYear}`)
                .lte('release_date', `${endYear}`);
              
              if (error) {
                console.error(`Error fetching movies for decade ${startYear}-${endYear}:`, error);
                return [];
              }
              
              return data || [];
            }
            return [];
          })
        );
        
        // Alle Ergebnisse zusammenführen
        let allMovies: any[] = [];
        decadeResults.forEach(movies => {
          allMovies = [...allMovies, ...movies];
        });
        
        // Doppelte Einträge entfernen
        const uniqueMovies = Array.from(new Set(allMovies.map(m => m.id)))
          .map(id => allMovies.find(m => m.id === id));
        
        // Jetzt filtern wir nach Genres wenn nötig
        if (uniqueGenres.length > 0) {
          // Da wir keine Genre-IDs in der Datenbank haben, müssen wir zusätzliche Informationen holen
          const moviesWithGenres = await Promise.all(
            uniqueMovies.map(async (movie) => {
              const movieData = await callTMDB(`/movie/${movie.id}`);
              return {
                ...movie,
                genre_ids: movieData.genres?.map((g: any) => g.id) || []
              };
            })
          );
          
          // Jetzt filtern wir nach den Genres
          const filteredByGenre = moviesWithGenres.filter(movie => {
            const movieGenreIds = movie.genre_ids || [];
            return uniqueGenres.some(genreId => movieGenreIds.includes(genreId));
          });
          
          return filteredByGenre.map(movie => ({
            ...movie,
            media_type: 'movie',
            isFreeMovie: movie.isfreemovie || false,
            hasStream: movie.hasstream || false,
            streamUrl: movie.streamurl || '',
            hasTrailer: movie.hastrailer || false,
            trailerUrl: movie.trailerurl || '',
            isNewTrailer: movie.isnewtrailer || false
          }));
        }
        
        // Wenn keine Genres angegeben sind, geben wir die einzigartigen Filme zurück
        return uniqueMovies.map(movie => ({
          ...movie,
          media_type: 'movie',
          isFreeMovie: movie.isfreemovie || false,
          hasStream: movie.hasstream || false,
          streamUrl: movie.streamurl || '',
          hasTrailer: movie.hastrailer || false,
          trailerUrl: movie.trailerurl || '',
          isNewTrailer: movie.isnewtrailer || false
        }));
      }
    }
    
    // Wenn keine Jahrzehnte angegeben sind, führen wir eine allgemeine Abfrage durch
    const { data: allMovies, error } = await query;
    
    if (error) {
      console.error('Error fetching movies from database:', error);
      return [];
    }
    
    if (!allMovies || allMovies.length === 0) {
      console.log('No movies found in database');
      return [];
    }
    
    // Wenn keine Genres angegeben sind, geben wir alle Filme zurück
    if (uniqueGenres.length === 0) {
      return allMovies.map(movie => ({
        ...movie,
        media_type: 'movie',
        isFreeMovie: movie.isfreemovie || false,
        hasStream: movie.hasstream || false,
        streamUrl: movie.streamurl || '',
        hasTrailer: movie.hastrailer || false,
        trailerUrl: movie.trailerurl || '',
        isNewTrailer: movie.isnewtrailer || false
      }));
    }
    
    // Ansonsten holen wir die Genres für jeden Film und filtern danach
    const moviesWithGenres = await Promise.all(
      allMovies.map(async (movie) => {
        const movieData = await callTMDB(`/movie/${movie.id}`);
        return {
          ...movie,
          genre_ids: movieData.genres?.map((g: any) => g.id) || []
        };
      })
    );
    
    // Jetzt filtern wir nach den Genres
    const filteredByGenre = moviesWithGenres.filter(movie => {
      const movieGenreIds = movie.genre_ids || [];
      return uniqueGenres.some(genreId => movieGenreIds.includes(genreId));
    });
    
    return filteredByGenre.map(movie => ({
      ...movie,
      media_type: 'movie',
      isFreeMovie: movie.isfreemovie || false,
      hasStream: movie.hasstream || false,
      streamUrl: movie.streamurl || '',
      hasTrailer: movie.hastrailer || false,
      trailerUrl: movie.trailerurl || '',
      isNewTrailer: movie.isnewtrailer || false
    }));
  } catch (error) {
    console.error('Error fetching movies by filters:', error);
    return [];
  }
};
