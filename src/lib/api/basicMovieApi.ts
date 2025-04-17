
import { MovieOrShow, MovieDetail } from '../types';
import { getAdminMovieSettings, callTMDB } from '../apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { downloadMovieImagesToServer } from './movieImportApi';
import { mapSupabaseMovieToMovieObject } from './movieUtils';

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
