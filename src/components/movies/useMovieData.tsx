
import { useState, useEffect } from 'react';
import { parseUrlSlug } from '@/lib/urlUtils';
import { getAdminMovieById, getMovieById, getSimilarMovies } from '@/lib/api';
import { toast } from 'sonner';
import type { MovieDetail, MovieOrShow } from '@/lib/types';

export function useMovieData(id: string | undefined, slug?: string) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState<MovieOrShow[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      const parsedId = slug ? parseUrlSlug(id).id : parseInt(id);
      
      if (!parsedId) {
        console.error('Ungültige Film-ID');
        return;
      }

      try {
        setIsLoading(true);
        
        // Versuche zuerst, den Film aus unserer Datenbank zu laden
        const adminMovie = await getAdminMovieById(parsedId);
        
        let movieData;
        if (adminMovie) {
          console.log('Film aus lokaler Datenbank geladen:', adminMovie);
          // Für lokale Filme benötigen wir zusätzliche Details von TMDB
          try {
            const tmdbMovie = await getMovieById(parsedId);
            
            // Kombinieren der Daten, wobei lokale Daten Priorität haben
            movieData = {
              ...tmdbMovie,
              ...adminMovie,
              // Wir wollen die TMDB Bilder verwenden, daher übernehmen wir nicht die lokalen Pfade
              poster_path: tmdbMovie.poster_path || adminMovie.poster_path,
              backdrop_path: tmdbMovie.backdrop_path || adminMovie.backdrop_path,
              // Genres explizit von TMDB übernehmen
              genres: tmdbMovie.genres || [],
              // Wichtige TMDB Daten explizit übernehmen
              cast: tmdbMovie.cast || [],
              crew: tmdbMovie.crew || [],
              runtime: tmdbMovie.runtime || adminMovie.runtime,
              // Andere wichtige Felder
              hasTrailer: adminMovie.hasTrailer,
              hasStream: adminMovie.hasStream,
              streamUrl: adminMovie.streamUrl,
              trailerUrl: adminMovie.trailerUrl,
              isFreeMovie: adminMovie.isFreeMovie,
              isNewTrailer: adminMovie.isNewTrailer,
            };
            
            console.log('Kombinierte Filmdaten:', movieData);
          } catch (error) {
            console.error('Fehler beim Abrufen der TMDB-Details, verwende nur lokale Daten', error);
            movieData = adminMovie;
          }
        } else {
          // Wenn nicht in unserer Datenbank, dann lade nur von TMDB
          movieData = await getMovieById(parsedId);
        }
        
        if (!movieData) {
          throw new Error(`Film mit ID ${parsedId} konnte nicht gefunden werden`);
        }
        
        console.log('Finale Filmdaten für Anzeige:', movieData);
        
        const similars = await getSimilarMovies(parsedId);
        
        setMovie(movieData);
        setSimilarMovies(similars);
      } catch (error) {
        console.error('Fehler beim Abrufen der Filmdetails:', error);
        toast.error('Fehler beim Laden des Films');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, slug]);

  return { movie, isLoading, similarMovies };
}
