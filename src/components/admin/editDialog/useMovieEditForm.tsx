
import { useState, useEffect } from 'react';
import { MovieOrShow } from '@/lib/types';
import { uploadMovieImage } from '@/lib/storage';
import { updateMovie } from '@/lib/api';
import { toast } from 'sonner';

export const useMovieEditForm = (
  movie: MovieOrShow | null,
  onUpdateSuccess: () => void,
  onOpenChange: (open: boolean) => void
) => {
  const [formData, setFormData] = useState<Partial<MovieOrShow>>({});
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [backdropPreview, setBackdropPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        overview: movie.overview || '',
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || '',
        release_date: movie.release_date || '',
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        streamUrl: movie.streamUrl || '',
        trailerUrl: movie.trailerUrl || '',
        hasStream: movie.hasStream || false,
        hasTrailer: movie.hasTrailer || false,
        isFreeMovie: movie.isFreeMovie || false,
        isNewTrailer: movie.isNewTrailer || false,
        genre_ids: movie.genre_ids || [],
        popularity: movie.popularity || 0,
        media_type: movie.media_type || 'movie',
      });
      
      // Reset file inputs and previews
      setPosterFile(null);
      setBackdropFile(null);
      setPosterPreview(movie.poster_path || '');
      setBackdropPreview(movie.backdrop_path || '');
    }
  }, [movie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movie || !movie.id) {
      toast.error('Keine Film-ID vorhanden');
      return;
    }
    
    setIsSaving(true);
    toast.loading('Änderungen werden gespeichert...');
    
    try {
      let updatedPosterPath = formData.poster_path;
      let updatedBackdropPath = formData.backdrop_path;
      
      // Upload new poster if selected
      if (posterFile) {
        const posterPath = await uploadMovieImage(posterFile, 'poster', movie.id);
        if (posterPath) {
          updatedPosterPath = posterPath;
        }
      }
      
      // Upload new backdrop if selected
      if (backdropFile) {
        const backdropPath = await uploadMovieImage(backdropFile, 'backdrop', movie.id);
        if (backdropPath) {
          updatedBackdropPath = backdropPath;
        }
      }
      
      const updatedMovie = {
        ...formData,
        id: movie.id,
        poster_path: updatedPosterPath,
        backdrop_path: updatedBackdropPath,
      };
      
      const success = await updateMovie(updatedMovie);
      
      toast.dismiss();
      if (success) {
        toast.success('Film erfolgreich aktualisiert');
        onUpdateSuccess();
        onOpenChange(false);
      } else {
        toast.error('Fehler beim Aktualisieren des Films');
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      toast.error('Fehler beim Aktualisieren des Films');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    posterFile,
    setPosterFile,
    backdropFile,
    setBackdropFile,
    posterPreview,
    setPosterPreview,
    backdropPreview,
    setBackdropPreview,
    isSaving,
    handleSubmit
  };
};
