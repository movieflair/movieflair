
import { useState } from 'react';
import { MovieOrShow } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

export const useAdminMovie = () => {
  const [selectedMovie, setSelectedMovie] = useState<MovieOrShow | null>(null);
  const [isFreeMovie, setIsFreeMovie] = useState(false);
  const [isNewTrailer, setIsNewTrailer] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamType, setStreamType] = useState<'embed' | 'link'>('embed');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [hasStream, setHasStream] = useState(false);
  const [hasTrailer, setHasTrailer] = useState(false);
  
  const queryClient = useQueryClient();

  const handleEditMovie = (movie: MovieOrShow) => {
    setSelectedMovie(movie);
    setIsFreeMovie(movie.isFreeMovie || false);
    setIsNewTrailer(movie.isNewTrailer || false);
    setStreamUrl(movie.streamUrl || '');
    setStreamType(movie.streamUrl?.includes('embed') ? 'embed' : 'link');
    setTrailerUrl(movie.trailerUrl || '');
    setHasStream(movie.isFreeMovie || false);
    setHasTrailer(movie.isNewTrailer || false);
  };

  const handleSaveMovie = async () => {
    if (!selectedMovie) return;

    try {
      const updatedMovie = {
        id: selectedMovie.id,
        title: selectedMovie.title,
        poster_path: selectedMovie.poster_path,
        backdrop_path: selectedMovie.backdrop_path,
        overview: selectedMovie.overview,
        release_date: selectedMovie.release_date,
        vote_average: selectedMovie.vote_average,
        vote_count: selectedMovie.vote_count,
        popularity: selectedMovie.popularity,
        media_type: selectedMovie.media_type,
        isfreemovie: isFreeMovie,
        isnewtrailer: isNewTrailer,
        hasstream: isFreeMovie,
        streamurl: isFreeMovie ? streamUrl : '',
        hastrailer: isNewTrailer,
        trailerurl: isNewTrailer ? trailerUrl : ''
      };

      const { error: saveError } = await supabase
        .from('admin_movies')
        .upsert(updatedMovie);
      
      if (saveError) {
        console.error('Error saving movie to Supabase:', saveError);
        toast.error("Fehler beim Speichern des Films");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-free-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trailer-movies'] });
      queryClient.invalidateQueries({ queryKey: ['search-movies'] });
      
      toast.success("Änderungen gespeichert");
      setSelectedMovie(null);
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error("Fehler beim Speichern des Films");
    }
  };

  return {
    selectedMovie,
    isFreeMovie,
    isNewTrailer,
    streamUrl,
    streamType,
    trailerUrl,
    hasStream,
    hasTrailer,
    setSelectedMovie,
    setIsFreeMovie,
    setIsNewTrailer,
    setStreamUrl,
    setStreamType,
    setTrailerUrl,
    setHasStream,
    setHasTrailer,
    handleEditMovie,
    handleSaveMovie
  };
};
