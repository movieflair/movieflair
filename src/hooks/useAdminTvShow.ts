
import { useState } from 'react';
import { MovieOrShow } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

export const useAdminTvShow = () => {
  const [selectedTvShow, setSelectedTvShow] = useState<MovieOrShow | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [hasTrailer, setHasTrailer] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamType, setStreamType] = useState<'embed' | 'link'>('embed');
  const [trailerUrl, setTrailerUrl] = useState('');
  
  const queryClient = useQueryClient();

  const handleEditTvShow = (show: MovieOrShow) => {
    setSelectedTvShow(show);
    setHasStream(show.hasStream || false);
    setStreamUrl(show.streamUrl || '');
    setStreamType(show.streamUrl?.includes('embed') ? 'embed' : 'link');
    setHasTrailer(show.hasTrailer || false);
    setTrailerUrl(show.trailerUrl || '');
  };

  const handleSaveTvShow = async () => {
    if (!selectedTvShow) return;

    try {
      const updatedShow = {
        id: selectedTvShow.id,
        name: selectedTvShow.name || selectedTvShow.title,
        poster_path: selectedTvShow.poster_path,
        backdrop_path: selectedTvShow.backdrop_path,
        overview: selectedTvShow.overview,
        first_air_date: selectedTvShow.first_air_date || selectedTvShow.release_date,
        vote_average: selectedTvShow.vote_average,
        vote_count: selectedTvShow.vote_count,
        popularity: selectedTvShow.popularity,
        media_type: selectedTvShow.media_type,
        hasstream: hasStream,
        streamurl: hasStream ? streamUrl : '',
        hastrailer: hasTrailer,
        trailerurl: hasTrailer ? trailerUrl : ''
      };

      const { error: saveError } = await supabase
        .from('admin_shows')
        .upsert(updatedShow);
      
      if (saveError) {
        console.error('Error saving show to Supabase:', saveError);
        toast.error("Fehler beim Speichern der Serie");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
      queryClient.invalidateQueries({ queryKey: ['search-tv-shows'] });
      
      toast.success("Änderungen gespeichert");
      setSelectedTvShow(null);
    } catch (error) {
      console.error('Error saving TV show:', error);
      toast.error("Fehler beim Speichern der Serie");
    }
  };

  return {
    selectedTvShow,
    hasStream,
    hasTrailer,
    streamUrl,
    streamType,
    trailerUrl,
    setSelectedTvShow,
    setHasStream,
    setHasTrailer,
    setStreamUrl,
    setStreamType,
    setTrailerUrl,
    handleEditTvShow,
    handleSaveTvShow
  };
};
