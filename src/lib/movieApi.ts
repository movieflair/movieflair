
import { MovieOrShow, MovieDetail } from './types';
import { getAdminMovieSettings, getAdminTvShowSettings, callTMDB } from './apiUtils';
import { supabase } from '@/integrations/supabase/client';
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
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count || 0,
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
    console.log(`Downloading images for movie ${movie.id} to server...`);
    
    let posterUpdated = false;
    let backdropUpdated = false;
    
    if (movie.poster_path && !movie.poster_path.startsWith('/storage')) {
      let posterUrl = movie.poster_path;
      
      if (posterUrl.startsWith('/')) {
        posterUrl = `https://image.tmdb.org/t/p/original${posterUrl}`;
      }
      
      console.log(`Downloading poster from ${posterUrl}`);
      try {
        const posterRes = await fetch(posterUrl);
        
        if (!posterRes.ok) {
          console.error(`Error downloading poster: ${posterRes.statusText}`);
          return false;
        }
        
        const posterBlob = await posterRes.blob();
        const posterFilename = `${movie.id}.jpg`;
        
        console.log(`Uploading poster as ${posterFilename} to movie_images/posters bucket`);
        
        const { data: posterData, error: posterError } = await supabase.storage
          .from('movie_images')
          .upload(`posters/${posterFilename}`, posterBlob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (posterError) {
          console.error('Error uploading poster:', posterError);
        } else {
          console.log('Poster uploaded successfully:', posterData?.path);
          posterUpdated = true;
        }
      } catch (error) {
        console.error('Error processing poster image:', error);
      }
    }
    
    if (movie.backdrop_path && !movie.backdrop_path.startsWith('/storage')) {
      let backdropUrl = movie.backdrop_path;
      
      if (backdropUrl.startsWith('/')) {
        backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;
      }
      
      console.log(`Downloading backdrop from ${backdropUrl}`);
      try {
        const backdropRes = await fetch(backdropUrl);
        
        if (!backdropRes.ok) {
          console.error(`Error downloading backdrop: ${backdropRes.statusText}`);
          return false;
        }
        
        const backdropBlob = await backdropRes.blob();
        const backdropFilename = `${movie.id}.jpg`;
        
        console.log(`Uploading backdrop as ${backdropFilename} to movie_images/backdrops bucket`);
        
        const { data: backdropData, error: backdropError } = await supabase.storage
          .from('movie_images')
          .upload(`backdrops/${backdropFilename}`, backdropBlob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (backdropError) {
          console.error('Error uploading backdrop:', backdropError);
        } else {
          console.log('Backdrop uploaded successfully:', backdropData?.path);
          backdropUpdated = true;
        }
      } catch (error) {
        console.error('Error processing backdrop image:', error);
      }
    }
    
    let posterUrl = '';
    let backdropUrl = '';
    
    if (posterUpdated) {
      const { data: posterPublicUrlData } = await supabase.storage
        .from('movie_images')
        .getPublicUrl(`posters/${movie.id}.jpg`);
      
      posterUrl = posterPublicUrlData.publicUrl;
    }
    
    if (backdropUpdated) {
      const { data: backdropPublicUrlData } = await supabase.storage
        .from('movie_images')
        .getPublicUrl(`backdrops/${movie.id}.jpg`);
      
      backdropUrl = backdropPublicUrlData.publicUrl;
    }
    
    if (posterUpdated || backdropUpdated) {
      const updateData: any = {
        id: movie.id,
      };
      
      if (posterUpdated) {
        updateData.poster_path = posterUrl;
      }
      
      if (backdropUpdated) {
        updateData.backdrop_path = backdropUrl;
      }
      
      console.log('Updating movie data with local image paths:', updateData);
      
      const { error: updateError } = await supabase
        .from('admin_movies')
        .upsert(updateData);
      
      if (updateError) {
        console.error('Error updating movie with local paths:', updateError);
        return false;
      } else {
        console.log('Movie paths successfully updated in database');
      }
    }
    
    return posterUpdated || backdropUpdated;
  } catch (error) {
    console.error('Error downloading images to server:', error);
    return false;
  }
};

export const getImportedMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching imported movies from database...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching imported movies from Supabase:', error);
      return [];
    }
    
    if (!importedMovies) {
      console.log('No imported movies found in Supabase');
      return [];
    }
    
    const mappedMovies = importedMovies.map(mapSupabaseMovieToMovieObject);
    console.log(`Found ${mappedMovies.length} imported movies in Supabase`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Error processing imported movies:', e);
    return [];
  }
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching free movies...');
  
  try {
    const { data: freeMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('isfreemovie', true)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching free movies from Supabase:', error);
      return [];
    }
    
    if (!freeMovies) {
      console.log('No free movies found in Supabase');
      return [];
    }
    
    const mappedMovies = freeMovies.map(mapSupabaseMovieToMovieObject);
    console.log(`Found ${mappedMovies.length} free movies in Supabase`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Error processing free movies:', e);
    return [];
  }
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  console.log('Fetching trailer movies...');
  let trailerItems: any[] = [];
  
  try {
    const { data: trailerMovies, error: moviesError } = await supabase
      .from('admin_movies')
      .select('*')
      .eq('isnewtrailer', true)
      .order('updated_at', { ascending: false });
    
    if (moviesError) {
      console.error('Error fetching trailer movies from Supabase:', moviesError);
    } else if (trailerMovies) {
      trailerItems = [...trailerItems, ...trailerMovies.map(mapSupabaseMovieToMovieObject)];
      console.log(`Found ${trailerMovies.length} trailer movies in Supabase`);
    }
    
    const { data: trailerShows, error: showsError } = await supabase
      .from('admin_shows')
      .select('*')
      .eq('hastrailer', true)
      .order('updated_at', { ascending: false });
    
    if (showsError) {
      console.error('Error fetching trailer shows from Supabase:', showsError);
    } else if (trailerShows) {
      trailerItems = [...trailerItems, ...trailerShows.map(mapSupabaseMovieToMovieObject)];
      console.log(`Found ${trailerShows.length} TV shows with trailers in Supabase`);
    }
    
    trailerItems.sort((a, b) => {
      const dateA = new Date(b.updated_at || '');
      const dateB = new Date(a.updated_at || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`Total trailer items: ${trailerItems.length}`);
    return trailerItems as MovieOrShow[];
  } catch (e) {
    console.error('Error processing trailers:', e);
    return [];
  }
};

export const deleteAllMovies = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_movies')
      .delete()
      .neq('id', 0); // Delete all entries
    
    if (error) {
      console.error('Error deleting all movies:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting all movies:', error);
    return false;
  }
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  try {
    const data = await callTMDB('/movie/popular');
    const savedSettings = await getAdminMovieSettings();
    
    return data.results
      ?.filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
      ?.map((movie: any) => {
        const savedMovie = savedSettings[movie.id] || {};
        return {
          ...movie,
          media_type: 'movie',
          isFreeMovie: savedMovie.isfreemovie || false,
          streamUrl: savedMovie.streamurl || '',
          isNewTrailer: savedMovie.isnewtrailer || false,
          hasTrailer: savedMovie.hastrailer || false,
          trailerUrl: savedMovie.trailerurl || '',
          isImported: !!savedMovie.id
        };
      }) || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  try {
    const data = await callTMDB('/search/movie', { query });
    const savedSettings = await getAdminMovieSettings();
    
    return data.results
      ?.filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
      ?.map((movie: any) => {
        const savedMovie = savedSettings[movie.id] || {};
        return {
          ...movie,
          media_type: 'movie',
          isFreeMovie: savedMovie.isfreemovie || false,
          streamUrl: savedMovie.streamurl || '',
          isNewTrailer: savedMovie.isnewtrailer || false,
          hasTrailer: savedMovie.hastrailer || false,
          trailerUrl: savedMovie.trailerurl || '',
          isImported: !!savedMovie.id
        };
      }) || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getPopularTvShows = async (): Promise<MovieOrShow[]> => {
  try {
    const data = await callTMDB('/tv/popular');
    const savedSettings = await getAdminTvShowSettings();
    
    return data.results
      ?.filter((show: any) => show.poster_path && show.overview && show.overview.trim() !== '')
      ?.map((show: any) => {
        const savedShow = savedSettings[show.id] || {};
        return {
          ...show,
          media_type: 'tv',
          hasStream: savedShow.hasstream || false,
          streamUrl: savedShow.streamurl || '',
          hasTrailer: savedShow.hastrailer || false,
          trailerUrl: savedShow.trailerurl || '',
        };
      }) || [];
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

export const searchTvShows = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  try {
    const data = await callTMDB('/search/tv', { query });
    const savedSettings = await getAdminTvShowSettings();
    
    return data.results
      ?.filter((show: any) => show.poster_path && show.overview && show.overview.trim() !== '')
      ?.map((show: any) => {
        const savedShow = savedSettings[show.id] || {};
        return {
          ...show,
          media_type: 'tv',
          hasStream: savedShow.hasstream || false,
          streamUrl: savedShow.streamurl || '',
          hasTrailer: savedShow.hastrailer || false,
          trailerUrl: savedShow.trailerurl || '',
        };
      }) || [];
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return [];
  }
};

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const { data: adminMovie, error: adminError } = await supabase
    .from('admin_movies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (adminError) {
    console.error('Error fetching movie from Supabase:', adminError);
  }

  try {
    const [movieData, videos, credits] = await Promise.all([
      callTMDB(`/movie/${id}`),
      callTMDB(`/movie/${id}/videos`),
      callTMDB(`/movie/${id}/credits`),
    ]);

    if (adminMovie) {
      console.log('Movie found in admin_movies table:', adminMovie);
      
      let finalMovieData = adminMovie;
      
      if ((adminMovie.poster_path && adminMovie.poster_path.includes('tmdb.org')) || 
          (adminMovie.backdrop_path && adminMovie.backdrop_path.includes('tmdb.org')) ||
          !adminMovie.poster_path || !adminMovie.backdrop_path) {
        
        console.log('Movie has TMDB image paths, downloading to server...');
        
        const success = await downloadMovieImagesToServer(mapSupabaseMovieToMovieObject(adminMovie));
        
        if (success) {
          const { data: updatedMovie } = await supabase
            .from('admin_movies')
            .select('*')
            .eq('id', id)
            .maybeSingle();
            
          if (updatedMovie) {
            finalMovieData = updatedMovie;
            console.log('Updated movie data:', finalMovieData);
          }
        }
      }
      
      return {
        ...movieData,
        media_type: 'movie',
        videos: { results: videos?.results || [] },
        cast: credits?.cast?.slice(0, 10) || [],
        crew: credits?.crew || [],
        hasTrailer: finalMovieData.hastrailer || videos?.results?.some((v: any) => v.type === 'Trailer'),
        hasStream: finalMovieData.hasstream || false,
        streamUrl: finalMovieData.streamurl || '',
        trailerUrl: finalMovieData.trailerurl || '',
        isFreeMovie: finalMovieData.isfreemovie || false,
        isNewTrailer: finalMovieData.isnewtrailer || false,
        poster_path: finalMovieData.poster_path,
        backdrop_path: finalMovieData.backdrop_path,
        vote_average: finalMovieData.vote_average || 0,
        vote_count: finalMovieData.vote_count || 0,
        genre_ids: [],
      };
    }

    const savedSettings = await getAdminMovieSettings();
    const savedMovie = savedSettings[id] || {};

    return {
      ...movieData,
      media_type: 'movie',
      videos: { results: videos?.results || [] },
      cast: credits?.cast?.slice(0, 10) || [],
      crew: credits?.crew || [],
      hasTrailer: savedMovie.hasTrailer ?? videos?.results?.some((v: any) => v.type === 'Trailer'),
      hasStream: savedMovie.hasStream || false,
      streamUrl: savedMovie.streamUrl || '',
      trailerUrl: savedMovie.trailerUrl || '',
      isFreeMovie: savedMovie.isFreeMovie || false,
      isNewTrailer: savedMovie.isNewTrailer || false,
      vote_average: adminMovie?.vote_average || 0,
      vote_count: adminMovie?.vote_count || 0,
      genre_ids: [],
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return {
      id,
      title: adminMovie?.title || 'Unknown Movie',
      poster_path: adminMovie?.poster_path || '',
      backdrop_path: adminMovie?.backdrop_path || '',
      overview: adminMovie?.overview || '',
      vote_average: adminMovie?.vote_average || 0,
      vote_count: adminMovie?.vote_count || 0,
      genre_ids: [],
      media_type: 'movie',
      videos: { results: [] },
      cast: [],
      crew: [],
      hasTrailer: adminMovie?.hastrailer || false,
      hasStream: adminMovie?.hasstream || false,
      streamUrl: adminMovie?.streamurl || '',
      trailerUrl: adminMovie?.trailerurl || '',
      isFreeMovie: adminMovie?.isfreemovie || false,
      isNewTrailer: adminMovie?.isnewtrailer || false,
      popularity: adminMovie?.popularity || 0,
      release_date: adminMovie?.release_date || ''
    };
  }
};

export const importMovieFromTMDB = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    console.log(`Importing movie: ${movie.title} (ID: ${movie.id})`);
    toast.loading(`Importiere "${movie.title}"...`);
    
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if movie exists:', checkError);
      toast.dismiss();
      toast.error('Fehler beim Prüfen, ob der Film bereits existiert');
      return false;
    }
    
    if (existingMovie) {
      console.log(`Movie ${movie.id} already exists, checking if images need to be updated`);
      const success = await downloadMovieImagesToServer(movie);
      
      toast.dismiss();
      if (success) {
        toast.success(`Bilder für "${movie.title}" erfolgreich aktualisiert`);
      } else {
        toast.error(`Fehler beim Aktualisieren der Bilder für "${movie.title}"`);
      }
      
      return success;
    }
    
    const fullMovieData = await getMovieById(movie.id);
    
    const movieToImport = {
      id: movie.id,
      title: movie.title || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
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
    
    const { error: importError } = await supabase
      .from('admin_movies')
      .upsert(movieToImport);
      
    if (importError) {
      console.error('Error importing movie:', importError);
      toast.dismiss();
      toast.error(`Fehler beim Importieren von "${movie.title}"`);
      return false;
    }
    
    console.log(`Movie "${movie.title}" successfully imported to database`);
    
    console.log(`Downloading images for movie ${movie.id} to local storage...`);
    const imagesUpdated = await downloadMovieImagesToServer(movie);
    
    toast.dismiss();
    toast.success(`Film "${movie.title}" erfolgreich importiert`);
    
    return true;
  } catch (error) {
    console.error('Error importing movie from list:', error);
    toast.dismiss();
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

export const getSimilarMovies = async (movieId: number): Promise<MovieOrShow[]> => {
  try {
    const data = await callTMDB(`/movie/${movieId}/similar`);
    const savedSettings = await getAdminMovieSettings();
    
    return data.results
      ?.filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '')
      ?.map((movie: any) => {
        const savedMovie = savedSettings[movie.id] || {};
        return {
          ...movie,
          media_type: 'movie',
          isFreeMovie: savedMovie.isfreemovie || false,
          streamUrl: savedMovie.streamurl || '',
          isNewTrailer: savedMovie.isnewtrailer || false,
          hasTrailer: savedMovie.hastrailer || false,
          trailerUrl: savedMovie.trailerurl || '',
        };
      }) || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};
