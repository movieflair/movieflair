import { useState } from 'react';
import { MovieOrShow } from '@/lib/types';
import { toast } from 'sonner';
import { updateMovie, uploadMovieImage } from '@/lib/api';

export const useMovieEditForm = (
  movie: MovieOrShow | null,
  onUpdateSuccess: () => void,
  onClose: (open: boolean) => void
) => {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    overview: movie?.overview || '',
    hasStream: movie?.hasStream || false,
    streamUrl: movie?.streamUrl || '',
    hasTrailer: movie?.hasTrailer || false,
    trailerUrl: movie?.trailerUrl || '',
    isFreeMovie: movie?.isFreeMovie || false,
    isNewTrailer: movie?.isNewTrailer || false,
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageFile: (file: File | null) => void,
    setImagePreview: (preview: string | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;

    setIsSaving(true);
    try {
      const updateData: Partial<MovieOrShow> = {
        id: movie.id,
        title: formData.title,
        overview: formData.overview,
        hasstream: formData.hasStream,
        streamurl: formData.streamUrl,
        hastrailer: formData.hasTrailer,
        trailerurl: formData.trailerUrl,
        isfreemovie: formData.isFreeMovie,
        isnewtrailer: formData.isNewTrailer,
      };

      if (posterFile) {
        toast.loading('Poster wird hochgeladen...');
        const posterPath = await uploadMovieImage(posterFile, 'poster', movie.id);
        if (posterPath) {
          updateData.poster_path = posterPath;
        } else {
          toast.error('Fehler beim Hochladen des Posters');
        }
        toast.dismiss();
      }

      if (backdropFile) {
        toast.loading('Hintergrundbild wird hochgeladen...');
        const backdropPath = await uploadMovieImage(backdropFile, 'backdrop', movie.id);
        if (backdropPath) {
          updateData.backdrop_path = backdropPath;
        } else {
          toast.error('Fehler beim Hochladen des Hintergrundbilds');
        }
        toast.dismiss();
      }

      toast.loading(`Film "${movie.title}" wird aktualisiert...`);
      const success = await updateMovie(updateData as MovieOrShow & { id: number });

      toast.dismiss();
      if (success) {
        toast.success(`Film "${movie.title}" wurde aktualisiert`);
        onUpdateSuccess();
        onClose(false);
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
    handleSubmit,
    handleImageChange
  };
};
