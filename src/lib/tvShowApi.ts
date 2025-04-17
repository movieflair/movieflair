import { MovieOrShow, MovieDetail } from './types';
import { callTMDB, getAdminTvShowSettings } from './apiUtils';

export const getPopularTvShows = async (): Promise<MovieOrShow[]> => {
  const data = await callTMDB('/tv/popular');
  const savedSettings = await getAdminTvShowSettings();
  
  return data.results.map((show: any) => {
    const savedShow = savedSettings[show.id] || {};
    return {
      ...show,
      media_type: 'tv',
      hasStream: savedShow.hasStream || false,
      streamUrl: savedShow.streamUrl || '',
      hasTrailer: savedShow.hasTrailer || false,
      trailerUrl: savedShow.trailerUrl || '',
    };
  });
};

export const getTvShowDetails = async (id: string): Promise<MovieDetail> => {
  const [showData, videos, credits] = await Promise.all([
    callTMDB(`/tv/${id}`),
    callTMDB(`/tv/${id}/videos`),
    callTMDB(`/tv/${id}/credits`),
  ]);

  const savedSettings = await getAdminTvShowSettings();
  const savedShow = savedSettings[id] || {};

  return {
    ...showData,
    media_type: 'tv',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: savedShow.hasTrailer ?? videos.results?.some((v: any) => v.type === 'Trailer'),
    hasStream: savedShow.hasStream || false,
    streamUrl: savedShow.streamUrl || '',
    trailerUrl: savedShow.trailerUrl || '',
  };
};

export const getCast = async (id: string, mediaType: 'movie' | 'tv'): Promise<any[]> => {
  const credits = await callTMDB(`/${mediaType}/${id}/credits`);
  return credits.cast?.slice(0, 10) || [];
};

export const searchTvShows = async (query: string): Promise<MovieOrShow[]> => {
  if (!query) return [];
  
  const data = await callTMDB('/search/tv', { query });
  const savedSettings = await getAdminTvShowSettings();
  
  return data.results.map((show: any) => {
    const savedShow = savedSettings[show.id] || {};
    return {
      ...show,
      media_type: 'tv',
      hasStream: savedShow.hasStream || false,
      streamUrl: savedShow.streamUrl || '',
      hasTrailer: savedShow.hasTrailer || false,
      trailerUrl: savedShow.trailerUrl || '',
    };
  });
};

export const getTvShowById = async (id: number): Promise<MovieDetail> => {
  const [showData, videos, credits] = await Promise.all([
    callTMDB(`/tv/${id}`),
    callTMDB(`/tv/${id}/videos`),
    callTMDB(`/tv/${id}/credits`),
  ]);

  const savedSettings = await getAdminTvShowSettings();
  const savedShow = savedSettings[id] || {};

  return {
    ...showData,
    media_type: 'tv',
    videos: { results: videos.results },
    cast: credits.cast?.slice(0, 10),
    crew: credits.crew,
    hasTrailer: savedShow.hasTrailer ?? videos.results?.some((v: any) => v.type === 'Trailer'),
    hasStream: savedShow.hasStream || false,
    streamUrl: savedShow.streamUrl || '',
    trailerUrl: savedShow.trailerUrl || '',
  };
};
