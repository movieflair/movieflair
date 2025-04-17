import { MovieOrShow, MovieDetail } from './types';
import { getAdminMovieSettings, getAdminTvShowSettings } from './apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { callTMDB } from './apiUtils';

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
    console.log(`Downloading images for movie ${movie.id} to server...`);
    
    let posterUpdated = false;
    let backdropUpdated = false;
    
    if (movie.poster_path && !movie.poster_path.startsWith('/storage') && (movie.poster_path.startsWith('http') || movie.poster_path.startsWith('/'))) {
      const posterUrl = movie.poster_path.startsWith('http') 
        ? movie.poster_path 
        : `https://image.tmdb.org/t/p/original${movie.poster_path}`;
      
      const posterRes = await fetch(posterUrl);
      const posterBlob = await posterRes.blob();
      
      const posterFile = new File([posterBlob], `movie_${movie.id}_poster.jpg`, { 
        type: 'image/jpeg' 
      });
      
      const { data: posterData, error: posterError } = await supabase.storage
        .from('movie_images')
        .upload(`posters/${movie.id}.jpg`, posterFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (posterError) {
        console.error('Error uploading poster:', posterError);
      } else {
        posterUpdated = true;
      }
    }
    
    if (movie.backdrop_path && !movie.backdrop_path.startsWith('/storage') && (movie.backdrop_path.startsWith('http') || movie.backdrop_path.startsWith('/'))) {
      const backdropUrl = movie.backdrop_path.startsWith('http') 
        ? movie.backdrop_path 
        : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
      
      const backdropRes = await fetch(backdropUrl);
      const backdropBlob = await backdropRes.blob();
      
      const backdropFile = new File([backdropBlob], `movie_${movie.id}_backdrop.jpg`, { 
        type: 'image/jpeg' 
      });
      
      const { data: backdropData, error: backdropError } = await supabase.storage
        .from('movie_images')
        .upload(`backdrops/${movie.id}.jpg`, backdropFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (backdropError) {
        console.error('Error uploading backdrop:', backdropError);
      } else {
        backdropUpdated = true;
      }
    }
    
    if (posterUpdated || backdropUpdated) {
      const updateData: any = {};
      
      if (posterUpdated) {
        updateData.poster_path = `/storage/movie_images/posters/${movie.id}.jpg`;
      }
      
      if (backdropUpdated) {
        updateData.backdrop_path = `/storage/movie_images/backdrops/${movie.id}.jpg`;
      }
      
      const { error: updateError } = await supabase
        .from('admin_movies')
        .update(updateData)
        .eq('id', movie.id);
      
      if (updateError) {
        console.error('Error updating movie with local paths:', updateError);
        return false;
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
    console.log(`Found ${mappedMovies.length} imported movies from Supabase`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Error processing imported movies:', e);
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
      console.log(`Found ${trailerMovies.length} trailer movies from Supabase`);
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
      console.log(`Found ${trailerShows.length} TV shows with trailers from Supabase`);
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
    console.log(`Found ${mappedMovies.length} free movies from Supabase`);
    return mappedMovies as MovieOrShow[];
  } catch (e) {
    console.error('Error processing free movies:', e);
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
  const { data: adminMovie, error: adminError } = await supabase
    .from('admin_movies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (adminError) {
    console.error('Error fetching movie from Supabase:', adminError);
  }

  const [movieData, videos, credits] = await Promise.all([
    callTMDB(`/movie/${id}`),
    callTMDB(`/movie/${id}/videos`),
    callTMDB(`/movie/${id}/credits`),
  ]);

  if (adminMovie) {
    console.log('Found movie in admin_movies table:', adminMovie);
    
    let finalMovieData = adminMovie;
    
    if ((adminMovie.poster_path && adminMovie.poster_path.includes('tmdb.org')) || 
        (adminMovie.backdrop_path && adminMovie.backdrop_path.includes('tmdb.org'))) {
      
      console.log('Movie has TMDB image paths, downloading to server...');
      await downloadMovieImagesToServer(mapSupabaseMovieToMovieObject(adminMovie));
      
      const { data: updatedMovie } = await supabase
        .from('admin_movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (updatedMovie) {
        finalMovieData = updatedMovie;
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
    
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('*')
      .in('id', similarMoviesIds);
    
    if (error) {
      console.error('Error fetching imported similar movies:', error);
      return [];
    }
    
    return importedMovies.map(movie => mapSupabaseMovieToMovieObject(movie));
  } catch (error) {
    console.error('Error getting similar movies:', error);
    return [];
  }
};

export const getRandomImportedMovie = async (): Promise<MovieDetail> => {
  console.log('Getting random imported movie...');
  
  try {
    const { data: importedMovies, error } = await supabase
      .from('admin_movies')
      .select('id')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching imported movies:', error);
      throw new Error('Fehler beim Laden importierter Filme');
    }
    
    if (!importedMovies || importedMovies.length === 0) {
      console.log('No imported movies found in database');
      throw new Error('Keine importierten Filme gefunden');
    }
    
    const randomIndex = Math.floor(Math.random() * importedMovies.length);
    const randomMovieId = importedMovies[randomIndex].id;
    
    console.log(`Selected random movie ID: ${randomMovieId}`);
    
    return getMovieById(randomMovieId);
    
  } catch (error) {
    console.error('Error getting random imported movie:', error);
    throw error;
  }
};

export const getRandomMovie = async (): Promise<MovieDetail> => {
  console.log('Getting random movie with improved decade selection...');
  
  const allDecades = ['1970', '1980', '1990', '2000', '2010', '2020'];
  
  const randomDecade = allDecades[Math.floor(Math.random() * allDecades.length)];
  console.log(`Selected random decade: ${randomDecade}`);
  
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
      
      console.log(`Searching for movies between ${startYear}-${endYear}`);
    }
    
    const data = await callTMDB('/discover/movie', params);
    
    if (!data.results || data.results.length === 0) {
      console.log('No results found, trying with fewer restrictions');
      
      params.vote_count_gte = '3';
      const fallbackData = await callTMDB('/discover/movie', params);
      
      if (!fallbackData.results || fallbackData.results.length === 0) {
        throw new Error('No movies found for the selected decade');
      }
      
      const validResults = fallbackData.results
        .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
      
      if (validResults.length === 0) {
        throw new Error('No valid movies found for the selected decade');
      }
      
      const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
      return getMovieById(randomMovie.id);
    }
    
    const validResults = data.results
      .filter((movie: any) => movie.poster_path && movie.overview && movie.overview.trim() !== '');
    
    if (validResults.length === 0) {
      throw new Error('No valid movies found for the selected decade');
    }
    
    const randomMovie = validResults[Math.floor(Math.random() * validResults.length)];
    return getMovieById(randomMovie.id);
    
  } catch (error) {
    console.error('Error getting random movie:', error);
    const popularMovies = await getPopularMovies();
    const randomIndex = Math.floor(Math.random() * popularMovies.length);
    return getMovieById(popularMovies[randomIndex].id);
  }
};

export const importMovieFromLists = async (movie: MovieOrShow): Promise<boolean> => {
  try {
    const { data: existingMovie, error: checkError } = await supabase
      .from('admin_movies')
      .select('id')
      .eq('id', movie.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if movie exists:', checkError);
      return false;
    }
    
    if (existingMovie) {
      console.log(`Movie ${movie.id} already exists, checking if images need to be updated`);
      return await downloadMovieImagesToServer(movie);
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
      return false;
    }
    
    console.log(`Downloading images for movie ${movie.id} to local storage...`);
    await downloadMovieImagesToServer(movie);
    
    return true;
  } catch (error) {
    console.error('Error importing movie from list:', error);
    return false;
  }
};
