
import { MovieOrShow, MovieDetail } from './types';
import { getAdminMovieSettings, getAdminTvShowSettings } from './apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { callTMDB } from './apiUtils';
import { toast } from 'sonner';

export const mapSupabaseMovieToMovieObject = (movie: any): MovieOrShow => {
  const genres = movie.genre_ids || [];
  
  return {
    id: movie.id,
    title: movie.title,
    name: movie.name,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    release_date: movie.release_date,
    first_air_date: movie.first_air_date,
    genre_ids: genres,
    media_type: movie.media_type || 'movie',
    hasStream: movie.hasstream || false,
    streamUrl: movie.streamurl || '',
    hasTrailer: movie.hastrailer || false,
    trailerUrl: movie.trailerurl || '',
    isFreeMovie: movie.isfreemovie || false,
    isNewTrailer: movie.isnewtrailer || false,
    popularity: movie.popularity || 0
  };
};

export const downloadMovieImagesToServer = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Lade Bilder für Film ${movie.id} auf den Server herunter...`);
    
    let posterUpdated = false;
    let backdropUpdated = false;
    
    // Lade das Poster-Bild herunter
    if (movie.poster_path && !movie.poster_path.startsWith('/storage')) {
      let posterUrl = movie.poster_path;
      
      // Konvertiere TMDB-Pfad zu vollständiger URL, wenn nötig
      if (posterUrl.startsWith('/')) {
        posterUrl = `https://image.tmdb.org/t/p/original${posterUrl}`;
      }
      
      console.log(`Lade Poster von ${posterUrl} herunter`);
      try {
        const posterRes = await fetch(posterUrl);
        
        if (!posterRes.ok) {
          console.error(`Fehler beim Herunterladen des Posters: ${posterRes.statusText}`);
          toast.error(`Fehler beim Herunterladen des Posters für ${movie.title}`);
          return false;
        }
        
        const posterBlob = await posterRes.blob();
        const posterFilename = `${movie.id}.jpg`;
        
        console.log(`Lade Poster als ${posterFilename} in den movie_images/posters Bucket hoch`);
        
        const { data: posterData, error: posterError } = await supabase.storage
          .from('movie_images')
          .upload(`posters/${posterFilename}`, posterBlob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (posterError) {
          console.error('Fehler beim Hochladen des Posters:', posterError);
          toast.error(`Fehler beim Hochladen des Posters für ${movie.title}`);
        } else {
          console.log('Poster erfolgreich hochgeladen:', posterData?.path);
          posterUpdated = true;
        }
      } catch (error) {
        console.error('Fehler beim Verarbeiten des Poster-Bildes:', error);
      }
    }
    
    // Lade das Backdrop-Bild herunter
    if (movie.backdrop_path && !movie.backdrop_path.startsWith('/storage')) {
      let backdropUrl = movie.backdrop_path;
      
      // Konvertiere TMDB-Pfad zu vollständiger URL, wenn nötig
      if (backdropUrl.startsWith('/')) {
        backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;
      }
      
      console.log(`Lade Hintergrundbild von ${backdropUrl} herunter`);
      try {
        const backdropRes = await fetch(backdropUrl);
        
        if (!backdropRes.ok) {
          console.error(`Fehler beim Herunterladen des Hintergrundbilds: ${backdropRes.statusText}`);
          toast.error(`Fehler beim Herunterladen des Hintergrundbilds für ${movie.title}`);
          return false;
        }
        
        const backdropBlob = await backdropRes.blob();
        const backdropFilename = `${movie.id}.jpg`;
        
        console.log(`Lade Hintergrundbild als ${backdropFilename} in den movie_images/backdrops Bucket hoch`);
        
        const { data: backdropData, error: backdropError } = await supabase.storage
          .from('movie_images')
          .upload(`backdrops/${backdropFilename}`, backdropBlob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (backdropError) {
          console.error('Fehler beim Hochladen des Hintergrundbilds:', backdropError);
          toast.error(`Fehler beim Hochladen des Hintergrundbilds für ${movie.title}`);
        } else {
          console.log('Hintergrundbild erfolgreich hochgeladen:', backdropData?.path);
          backdropUpdated = true;
        }
      } catch (error) {
        console.error('Fehler beim Verarbeiten des Hintergrundbilds:', error);
      }
    }
    
    // Aktualisiere die Filmdaten mit den neuen Bildpfaden
    if (posterUpdated || backdropUpdated) {
      const updateData: any = {
        id: movie.id,
      };
      
      if (posterUpdated) {
        updateData.poster_path = `/storage/movie_images/posters/${movie.id}.jpg`;
      }
      
      if (backdropUpdated) {
        updateData.backdrop_path = `/storage/movie_images/backdrops/${movie.id}.jpg`;
      }
      
      console.log('Aktualisiere Filmpfade in der Datenbank:', updateData);
      
      const { error: updateError } = await supabase
        .from('admin_movies')
        .upsert(updateData);
      
      if (updateError) {
        console.error('Fehler beim Aktualisieren des Films mit lokalen Pfaden:', updateError);
        toast.error(`Fehler beim Aktualisieren der Bildpfade für ${movie.title}`);
        return false;
      } else {
        console.log('Filmpfade erfolgreich in der Datenbank aktualisiert');
        toast.success(`Bilder für ${movie.title} erfolgreich importiert`);
      }
    }
    
    return posterUpdated || backdropUpdated;
  } catch (error) {
    console.error('Fehler beim Herunterladen von Bildern auf den Server:', error);
    toast.error('Fehler beim Importieren von Filmbildern');
    return false;
  }
};

// Lösche alle vorhandenen Filme aus der Datenbank
export const deleteAllMovies = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .delete()
      .neq('id', 0); // Lösche alle Einträge
    
    if (error) {
      console.error('Fehler beim Löschen aller Filme:', error);
      toast.error('Fehler beim Löschen aller Filme');
      return false;
    }
    
    toast.success('Alle Filme wurden erfolgreich gelöscht');
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen aller Filme:', error);
    toast.error('Fehler beim Löschen aller Filme');
    return false;
  }
};

// Der Rest der Funktionen bleibt gleich
export const getImportedMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Hole importierte Filme aus der Datenbank...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen importierter Filme aus Supabase:', error);
      return [];
    }
    
    if (!importedMovies) {
      console.log('Keine importierten Filme in Supabase gefunden');
      return [];
    }
    
    const mappedMovies = importedMovies.map(mapSupabaseMovieToMovieObject);
    console.log(`${mappedMovies.length} importierte Filme aus Supabase gefunden`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Fehler bei der Verarbeitung importierter Filme:', e);
    return [];
  }
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Hole kostenlose Filme...');
  
  try {
    const { data: freeMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('isfreemovie', true)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen kostenloser Filme aus Supabase:', error);
      return [];
    }
    
    if (!freeMovies) {
      console.log('Keine kostenlosen Filme in Supabase gefunden');
      return [];
    }
    
    const mappedMovies = freeMovies.map(mapSupabaseMovieToMovieObject);
    console.log(`${mappedMovies.length} kostenlose Filme aus Supabase gefunden`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Fehler bei der Verarbeitung kostenloser Filme:', e);
    return [];
  }
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Hole Trailer-Filme...');
  let trailerItems: any[] = [];
  
  try {
    const { data: trailerMovies, error: moviesError } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('isnewtrailer', true)
      .order('updated_at', { ascending: false });
    
    if (moviesError) {
      console.error('Fehler beim Abrufen von Trailer-Filmen aus Supabase:', moviesError);
    } else if (trailerMovies) {
      trailerItems = [...trailerItems, ...trailerMovies.map(mapSupabaseMovieToMovieObject)];
      console.log(`${trailerMovies.length} Trailer-Filme aus Supabase gefunden`);
    }
    
    const { data: trailerShows, error: showsError } = await supabase
      .from('admin_shows')
      .select('*')
      .eq('hastrailer', true)
      .order('updated_at', { ascending: false });
    
    if (showsError) {
      console.error('Fehler beim Abrufen von Trailer-Shows aus Supabase:', showsError);
    } else if (trailerShows) {
      trailerItems = [...trailerItems, ...trailerShows.map(mapSupabaseMovieToMovieObject)];
      console.log(`${trailerShows.length} TV-Shows mit Trailern aus Supabase gefunden`);
    }
    
    trailerItems.sort((a, b) => {
      const dateA = new Date(b.updated_at || '');
      const dateB = new Date(a.updated_at || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`Trailer-Elemente insgesamt: ${trailerItems.length}`);
    return trailerItems as MovieOrShow[];
  } catch (e) {
    console.error('Fehler bei der Verarbeitung von Trailern:', e);
    return [];
  }
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/movie/popular');
  const savedSettings = await getAdminMovieSettings();
  
  return data.results
    .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
    .map((movie: any) => {
      const savedMovie = savedSettings[movie.id] || {};
      return {
        ...movie,
        media_type: 'movie',
        isFreeMovie: savedMovie.isFreeMovie || false,
        streamUrl: savedMovie.streamUrl || '',
        isNewTrailer: savedMovie.isNewTrailer || false,
        hasTrailer: savedMovie.hasTrailer || false,
        trailerUrl: savedMovie.trailerUrl || '',
      };
    });
};

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/movie', { query });
  const savedSettings = await getAdminMovieSettings();
  
  return data.results
    .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
    .map((movie: any) => {
      const savedMovie = savedSettings[movie.id] || {};
      return {
        ...movie,
        media_type: 'movie',
        isFreeMovie: savedMovie.isFreeMovie || false,
        streamUrl: savedMovie.streamUrl || '',
        isNewTrailer: savedMovie.isNewTrailer || false,
        hasTrailer: savedMovie.hasTrailer || false,
        trailerUrl: savedMovie.trailerUrl || '',
      };
    });
};

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  // Prüfen, ob der Film bereits in der Datenbank existiert
  const { data: adminMovie, error: adminError } = await supabase
    .from('admin_movies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (adminError) {
    console.error('Fehler beim Abrufen des Films aus Supabase:', adminError);
  }

  // TMDB-Daten für den Film abrufen
  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  if (adminMovie) {
    console.log('Film in der admin_movies-Tabelle gefunden:', adminMovie);
    
    let finalMovieData = adminMovie;
    
    // Wenn der Film TMDB-Bildpfade hat, lade diese auf den Server herunter
    if ((adminMovie.poster_path && adminMovie.poster_path.includes('tmdb.org')) || 
        (adminMovie.backdrop_path && adminMovie.backdrop_path.includes('tmdb.org')) ||
        !adminMovie.poster_path || !adminMovie.backdrop_path) {
      
      console.log('Film hat TMDB-Bildpfade, lade auf Server herunter...');
      
      const success = await downloadMovieImagesToServer(mapSupabaseMovieToMovieObject(adminMovie));
      
      if (success) {
        // Aktualisierte Filmdaten abrufen
        const { data: updatedMovie } = await supabase
          .from('admin_movies')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (updatedMovie) {
          finalMovieData = updatedMovie;
          console.log('Aktualisierte Filmdaten:', finalMovieData);
        }
      }
    }
    
    return {
      ...movieData,
      media_type: 'movie',
      videos: { results: videos.results },
      cast: credits.cast?.slice(0, 10),
      crew: credits.crew,
      hasTrailer: finalMovieData.hastrailer || videos.results?.some((v: any) => v.type === 'Trailer'),
      hasStream: finalMovieData.hasstream || false,
      streamUrl: finalMovieData.streamurl || '',
      trailerUrl: finalMovieData.trailerurl || '',
      isFreeMovie: finalMovieData.isfreemovie || false,
      isNewTrailer: finalMovieData.isnewtrailer || false,
      poster_path: finalMovieData.poster_path,
      backdrop_path: finalMovieData.backdrop_path,
    };
  }

  // Wenn der Film nicht in der Datenbank ist, verwende die TMDB-Daten
  const savedSettings = await getAdminMovieSettings();
  const savedMovie = savedSettings[id] || {};

  return {
    ...movieData,
    media_type: 'movie',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: savedMovie.hasTrailer ?? videos.results?.some((v: any) => v.type === 'Trailer'),
    hasStream: savedMovie.hasStream || false,
    streamUrl: savedMovie.streamUrl || '',
    trailerUrl: savedMovie.trailerUrl || '',
    isFreeMovie: savedMovie.isFreeMovie || false,
    isNewTrailer: savedMovie.isNewTrailer || false,
  };
};

export const getSimilarMovies = async (id: number): Promise<MovieOrShow[]> => {
  try {
    const data = await callTMDB(`/movie/${id}/similar`);
    const similarMoviesIds = data.results
      .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
      .map((movie: any) => movie.id);
    
    if (similarMoviesIds.length === 0) {
      return [];
    }
    
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .in('id', similarMoviesIds);
    
    if (error) {
      console.error('Fehler beim Abrufen importierter ähnlicher Filme:', error);
      return [];
    }
    
    if (!importedMovies || importedMovies.length === 0) {
      console.log('Keine importierten ähnlichen Filme gefunden, gebe TMDB-Ergebnisse zurück');
      return data.results
        .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
        .map((movie: any) => ({
          ...movie,
          media_type: 'movie'
        }));
    }
    
    return importedMovies.map(movie => mapSupabaseMovieToMovieObject(movie));
  } catch (error) {
    console.error('Fehler beim Abrufen ähnlicher Filme:', error);
    return [];
  }
};

export const importMovieFromLists = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Importiere Film: ${movie.title} (ID: ${movie.id})`);
    
    // Prüfen, ob der Film bereits existiert
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Fehler beim Prüfen, ob der Film existiert:', checkError);
      return false;
    }
    
    // Wenn der Film bereits existiert, prüfe, ob die Bilder aktualisiert werden müssen
    if (existingMovie) {
      console.log(`Film ${movie.id} existiert bereits, prüfe, ob Bilder aktualisiert werden müssen`);
      const success = await downloadMovieImagesToServer(movie);
      
      if (success) {
        toast.success(`Bilder für "${movie.title}" erfolgreich aktualisiert`);
      } else {
        toast.error(`Fehler beim Aktualisieren der Bilder für "${movie.title}"`);
      }
      
      return success;
    }
    
    // Vollständige Filmdaten abrufen
    const fullMovieData = await getMovieById(movie.id);
    
    // Filme für den Import vorbereiten
    const movieToImport = {
      id: movie.id,
      title: movie.title || '',
      overview: movie.overview || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      popularity: movie.popularity || 0,
      media_type: 'movie',
      isfreemovie: false,
      isnewtrailer: false,
      hasstream: false,
      streamurl: '',
      hastrailer: !!fullMovieData.videos?.results?.some((v: any) => v.type === 'Trailer'),
      trailerurl: fullMovieData.videos?.results?.find((v: any) => v.type === 'Trailer')?.key ? 
        `https://www.youtube.com/embed/${fullMovieData.videos.results.find((v: any) => v.type === 'Trailer').key}` : ''
    };
    
    // Zuerst den Film ohne Bildpfade importieren
    const { error: importError } = await supabase
      .from('admin_movies')
      .upsert(movieToImport);
      
    if (importError) {
      console.error('Fehler beim Importieren des Films:', importError);
      toast.error(`Fehler beim Importieren von "${movie.title}"`);
      return false;
    }
    
    console.log(`Film "${movie.title}" erfolgreich in die Datenbank importiert`);
    toast.success(`Film "${movie.title}" erfolgreich importiert`);
    
    // Dann die Bilder herunterladen und die Bildpfade aktualisieren
    console.log(`Lade Bilder für Film ${movie.id} in den lokalen Speicher herunter...`);
    const imagesUpdated = await downloadMovieImagesToServer(movie);
    
    if (imagesUpdated) {
      console.log(`Bilder für Film ${movie.id} erfolgreich aktualisiert`);
    } else {
      console.log(`Fehler beim Aktualisieren der Bilder für Film ${movie.id}`);
    }
    
    return true;
  } catch (error) {
    console.error('Fehler beim Importieren des Films aus der Liste:', error);
    toast.error(`Fehler beim Importieren des Films: ${error.message}`);
    return false;
  }
};

export const getRandomImportedMovie = async (): Promise<MovieDetail> => {
  console.log('Hole zufälligen importierten Film...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('id')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen importierter Filme:', error);
      throw new Error('Fehler beim Laden importierter Filme');
    }
    
    if (!importedMovies || importedMovies.length === 0) {
      console.log('Keine importierten Filme in der Datenbank gefunden');
      throw new Error('Keine importierten Filme gefunden');
    }
    
    const randomIndex = Math.floor(Math.random() * importedMovies.length);
    const randomMovieId = importedMovies[randomIndex].id;
    
    console.log(`Zufällige Film-ID ausgewählt: ${randomMovieId}`);
    
    return getMovieById(randomMovieId);
    
  } catch (error) {
    console.error('Fehler beim Abrufen eines zufälligen importierten Films:', error);
    throw error;
  }
};

export const getRandomMovie = async (): Promise<MovieDetail> => {
  console.log('Hole zufälligen Film mit verbesserter Jahrzehntauswahl...');
  
  const allDecades = ['1970', '1980', '1990', '2000', '2010', '2020'];
  
  const randomDecade = allDecades[Math.floor(Math.random() * allDecades.length)];
  console.log(`Zufälliges Jahrzehnt ausgewählt: ${randomDecade}`);
  
  try {
    let params: Record<string, any> = {
      'sort_by': 'popularity.desc',
      'vote_count.gte': '5',
      'include_adult': 'false',
      'include_video': 'false',
      'page': '1',
    };
    
    const decade = parseInt(randomDecade);
    if (!isNaN(decade)) {
      const startYear = decade;
      const endYear = decade + 9;
      
      params = {
        ...params,
        'primary_release_date.gte': `${startYear}-01-01`,
        'primary_release_date.lte': `${endYear}-12-31`
      };
      
      console.log(`Suche nach Filmen zwischen ${startYear}-${endYear}`);
    }
    
    const data = await callTMDB('/discover/movie', params);
    
    if (!data.results || data.results.length === 0) {
      console.log('Keine Ergebnisse gefunden, versuche mit weniger Einschränkungen');
      
      params.vote_count_gte = '3';
      const fallbackData = await callTMDB('/discover/movie', params);
      
      if (!fallbackData.results || fallbackData.results.length === 0) {
        throw new Error('Keine Filme für das ausgewählte Jahrzehnt gefunden');
      }
      
      const validResults = fallbackData.results
        .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
      
      if (validResults.length === 0) {
        throw new Error('Keine gültigen Filme für das ausgewählte Jahrzehnt gefunden');
      }
      
      const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
      return getMovieById(randomMovie.id);
    }
    
    const validResults = data.results
      .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
    
    if (validResults.length === 0) {
      throw new Error('Keine gültigen Filme für das ausgewählte Jahrzehnt gefunden');
    }
    
    const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
    return getMovieById(randomMovie.id);
    
  } catch (error) {
    console.error('Fehler beim Abrufen eines zufälligen Films:', error);
    const popularMovies = await getPopularMovies();
    const randomIndex = Math.floor(Math.random() * popularMovies.length);
    return getMovieById(popularMovies[randomIndex].id);
  }
};
