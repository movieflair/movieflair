import { useState, useEffect } from 'react';
import { MovieDetail } from '@/lib/types';
import { getTvShowById, getTvShowDetails, getCast } from '@/lib/tvShowApi';

export const useShowData = (id: string | undefined, slug?: string) => {
  const [show, setShow] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [similarShows, setSimilarShows] = useState<any[]>([]);

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!id) {
        console.error('No ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First try to load the show from our database
        const adminShow = await getTvShowById(parseInt(id));
        
        let showData;
        if (adminShow) {
          console.log('Show loaded from local database:', adminShow);
          // For local shows we need additional details from TMDB
          const tmdbShow = await getTvShowDetails(id);
          
          // Combine the data, with local data taking priority
          showData = {
            ...tmdbShow,
            ...adminShow,
            // Ensure local paths for images are used
            poster_path: adminShow.poster_path || tmdbShow.poster_path,
            backdrop_path: adminShow.backdrop_path || tmdbShow.backdrop_path,
            // Other important fields
            hasTrailer: adminShow.hasTrailer,
            hasStream: adminShow.hasStream,
            streamUrl: adminShow.streamUrl,
            trailerUrl: adminShow.trailerUrl
          };
        } else {
          // If not in our database, then just load from TMDB
          showData = await getTvShowDetails(id);
        }
        
        const castData = await getCast(id, 'tv');

        setShow(showData);
        setCast(castData);
        // In the future, we could add similar shows here
        setSimilarShows([]);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  return { show, isLoading, cast, similarShows };
};
