
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MovieOrShow } from '@/lib/types';
import MovieEditForm from './editDialog/MovieEditForm';
import { useMovieEditForm } from './editDialog/useMovieEditForm';

interface MovieEditDialogProps {
  movie: MovieOrShow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess: () => void;
}

const MovieEditDialog: React.FC<MovieEditDialogProps> = ({ 
  movie, 
  open, 
  onOpenChange,
  onUpdateSuccess 
}) => {
  const {
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
  } = useMovieEditForm(movie, onUpdateSuccess, onOpenChange);

  const renderForm = () => {
    if (!movie) return null;

    return (
      <MovieEditForm
        movie={movie}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        posterFile={posterFile}
        setPosterFile={setPosterFile}
        backdropFile={backdropFile}
        setBackdropFile={setBackdropFile}
        posterPreview={posterPreview}
        setPosterPreview={setPosterPreview}
        backdropPreview={backdropPreview}
        setBackdropPreview={setBackdropPreview}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Film bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeite die Informationen für "{movie?.title}"
          </DialogDescription>
        </DialogHeader>
        
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default MovieEditDialog;
