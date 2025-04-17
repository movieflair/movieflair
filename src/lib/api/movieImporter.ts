
import { MovieOrShow, MovieDetail } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setupStorage } from '@/lib/setupStorage';

/**
 * Importiert einen Film von TMDB in unsere lokale Datenbank
 */
export const importMovieFromTMDB = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Importiere Film: ${movie.title || 'Unbekannt'} (ID: ${movie.id})`);
    
    // Sicherstellen, dass der Storage-Bucket existiert
    await setupStorage();
    
    // Zunächst prüfen, ob der Film bereits existiert
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Fehler beim Prüfen, ob der Film existiert:', checkError);
      toast.error(`Fehler bei der Datenbankabfrage: ${checkError.message}`);
      return false;
    }
    
    // Detaillierte Filminformationen von TMDB abrufen
    let fullMovieData: any = { ...movie };
    let directorName = '';
    let castList: any[] = [];
    
    try {
      console.log('Hole detaillierte Filmdaten von TMDB...');
      const { data: movieDetails, error } = await supabase.functions.invoke('tmdb-admin', {
        body: { 
          action: 'getById',
          movieId: movie.id
        }
      });
      
      if (error) {
        console.error('Fehler beim Abrufen detaillierter Filmdaten:', error);
        toast.error(`TMDB-API Fehler: ${error.message}`);
      } else if (movieDetails) {
        console.log('Detaillierte Filmdaten von TMDB erhalten:', movieDetails);
        fullMovieData = {
          ...fullMovieData,
          ...movieDetails
        };
        
        // Extrahiere Regie und Besetzung
        if (movieDetails.credits && movieDetails.credits.crew) {
          const director = movieDetails.credits.crew.find((person: any) => person.job === 'Director');
          if (director) {
            directorName = director.name;
            console.log(`Regisseur gefunden: ${directorName}`);
          }
        }
        
        if (movieDetails.credits && movieDetails.credits.cast) {
          castList = movieDetails.credits.cast.slice(0, 4).map((person: any) => ({
            id: person.id,
            name: person.name,
            character: person.character
          }));
          console.log(`Besetzung gefunden: ${castList.length} Personen`);
        }
      }
    } catch (error: any) {
      console.log('Konnte keine zusätzlichen Filmdetails abrufen:', error);
      toast.error(`Fehler: ${error.message}`);
    }
    
    // Trailer-URL vorbereiten, falls verfügbar
    let hasTrailer = fullMovieData.hasTrailer || false;
    let trailerUrl = fullMovieData.trailerUrl || '';
    
    if (fullMovieData.videos?.results?.length > 0 && !trailerUrl) {
      const trailer = fullMovieData.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer && trailer.key) {
        hasTrailer = true;
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        console.log(`Trailer gefunden: ${trailerUrl}`);
      }
    }
    
    // Bilder verarbeiten
    let posterPath = fullMovieData.poster_path || '';
    let backdropPath = fullMovieData.backdrop_path || '';
    
    // Versuchen, Bilder auf lokalen Speicher hochzuladen
    try {
      console.log('Lade Bilder zum lokalen Speicher hoch...');
      if (posterPath && !posterPath.startsWith('/storage')) {
        console.log(`Versuche Poster-Bild zu speichern: ${posterPath}`);
        const { data, error } = await supabase.functions.invoke('create-movie-storage', {
          body: {
            movieId: movie.id,
            imageUrl: posterPath,
            imageType: 'poster'
          }
        });
        
        if (error) {
          console.error('Fehler beim Hochladen des Posters:', error);
        } else if (data?.publicUrl) {
          console.log(`Poster erfolgreich gespeichert: ${data.publicUrl}`);
          posterPath = data.publicUrl;
        }
      }
      
      if (backdropPath && !backdropPath.startsWith('/storage')) {
        console.log(`Versuche Hintergrundbild zu speichern: ${backdropPath}`);
        const { data, error } = await supabase.functions.invoke('create-movie-storage', {
          body: {
            movieId: movie.id,
            imageUrl: backdropPath,
            imageType: 'backdrop'
          }
        });
        
        if (error) {
          console.error('Fehler beim Hochladen des Hintergrundbilds:', error);
        } else if (data?.publicUrl) {
          console.log(`Hintergrundbild erfolgreich gespeichert: ${data.publicUrl}`);
          backdropPath = data.publicUrl;
        }
      }
    } catch (error: any) {
      console.error('Fehler beim Speichern der Bilder:', error);
    }
    
    // Speichern der Laufzeit
    const runtime = fullMovieData.runtime || null;
    if (runtime) {
      console.log(`Film-Laufzeit: ${runtime} Minuten`);
    }
    
    // Regie und Besetzung als JSON speichern
    const creditsData = {
      director: directorName ? { name: directorName } : null,
      cast: castList
    };
    
    const creditsJson = JSON.stringify(creditsData);
    console.log('Credits-Daten zum Speichern:', creditsJson);
    
    if (existingMovie) {
      console.log(`Film ${movie.id} existiert bereits, Daten werden aktualisiert`);
      
      // Filmdaten in unserer Datenbank aktualisieren
      const { error: updateError } = await supabase
        .from('admin_movies')
        .update({
          title: fullMovieData.title || '',
          overview: fullMovieData.overview || '',
          poster_path: posterPath,
          backdrop_path: backdropPath,
          release_date: fullMovieData.release_date || '',
          vote_average: fullMovieData.vote_average || 0,
          vote_count: fullMovieData.vote_count || 0,
          popularity: fullMovieData.popularity || 0,
          hastrailer: hasTrailer,
          trailerurl: trailerUrl,
          runtime: runtime
        })
        .eq('id', movie.id);
        
      if (updateError) {
        console.error('Fehler beim Aktualisieren der Filmdaten:', updateError);
        toast.error(`Datenbankfehler: ${updateError.message}`);
        return false;
      }
      
      // Try to update credits separately to handle potential missing column
      try {
        // Check if credits column exists in admin_movies table
        const { data: columnsData, error: columnsError } = await supabase
          .from('admin_movies')
          .select('credits')
          .limit(1);
          
        if (columnsError) {
          console.error('Fehler beim Überprüfen, ob die Credits-Spalte existiert:', columnsError);
        } else {
          // If we got here, the column exists, update it
          // Use type assertion to add the credits property
          const updateData: any = { credits: creditsJson };
          const { error: creditsError } = await supabase
            .from('admin_movies')
            .update(updateData)
            .eq('id', movie.id);
            
          if (creditsError) {
            console.error('Fehler beim Aktualisieren der Credits-Daten:', creditsError);
            console.log('Credits-Daten konnten nicht gespeichert werden.');
          } else {
            console.log('Credits-Daten erfolgreich aktualisiert');
          }
        }
      } catch (creditsError) {
        console.error('Fehler beim Aktualisieren der Credits-Daten:', creditsError);
      }
      
      console.log(`Filmdaten für "${fullMovieData.title}" erfolgreich aktualisiert`);
      return true;
    }
    
    // Wenn der Film nicht existiert, einen neuen Eintrag erstellen
    const movieToImport = {
      id: movie.id,
      title: fullMovieData.title || '',
      poster_path: posterPath,
      backdrop_path: backdropPath,
      overview: fullMovieData.overview || '',
      release_date: fullMovieData.release_date || '',
      vote_average: fullMovieData.vote_average || 0,
      vote_count: fullMovieData.vote_count || 0,
      popularity: fullMovieData.popularity || 0,
      media_type: 'movie',
      isfreemovie: false,
      isnewtrailer: false,
      hasstream: false,
      streamurl: '',
      hastrailer: hasTrailer,
      trailerurl: trailerUrl,
      runtime: runtime
    };
    
    console.log('Füge Film in Datenbank ein:', movieToImport);
    
    const { error: importError } = await supabase
      .from('admin_movies')
      .insert(movieToImport);
      
    if (importError) {
      console.error('Fehler beim Importieren des Films:', importError);
      toast.error(`Import fehlgeschlagen: ${importError.message}`);
      return false;
    }
    
    // Try to update credits separately to handle potential missing column
    try {
      // Check if credits column exists in admin_movies table
      const { data: columnsData, error: columnsError } = await supabase
        .from('admin_movies')
        .select('credits')
        .limit(1);
        
      if (columnsError) {
        console.error('Fehler beim Überprüfen, ob die Credits-Spalte existiert:', columnsError);
      } else {
        // If we got here, the column exists, update it
        // Use type assertion to add the credits property
        const updateData: any = { credits: creditsJson };
        const { error: creditsError } = await supabase
          .from('admin_movies')
          .update(updateData)
          .eq('id', movie.id);
          
        if (creditsError) {
          console.error('Fehler beim Hinzufügen der Credits-Daten:', creditsError);
          console.log('Credits-Daten konnten nicht gespeichert werden. Die Spalte "credits" muss zur Tabelle "admin_movies" hinzugefügt werden.');
        } else {
          console.log('Credits-Daten erfolgreich hinzugefügt');
        }
      }
    } catch (creditsError) {
      console.error('Fehler beim Hinzufügen der Credits-Daten:', creditsError);
    }
    
    console.log(`Film "${fullMovieData.title}" erfolgreich in Datenbank importiert`);
    toast.success(`Film "${fullMovieData.title}" erfolgreich importiert`);
    return true;
  } catch (error: any) {
    console.error('Fehler beim Importieren des Films:', error);
    toast.error(`Allgemeiner Fehler: ${error.message}`);
    return false;
  }
};
