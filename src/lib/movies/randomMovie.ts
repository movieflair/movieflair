
import { MovieDetail } from '../types';
import { callTMDB } from '../apiUtils';
import { getMovieById } from './movieDetails';

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
      params = {
        ...params,
        'primary_release_date.gte': `${decade}-01-01`,
        'primary_release_date.lte': `${decade + 9}-12-31`
      };
      console.log(`Searching for movies between ${decade}-${decade + 9}`);
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
