import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MovieOrShow } from '@/lib/types';
import { updateMovie, downloadImageToStorage } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Upload, Image } from 'lucide-react';
import { uploadMovieImage } from '@/lib/storage';

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
      });
      
      // Reset file inputs and previews
      setPosterFile(null);
      setBackdropFile(null);
      setPosterPreview(movie.poster_path || '');
      setBackdropPreview(movie.backdrop_path || '');
    }
  }, [movie]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleBackdropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackdropFile(file);
      setBackdropPreview(URL.createObjectURL(file));
    }
  };

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

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '/placeholder.svg';
    if (path.startsWith('/storage')) return path;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const renderForm = () => {
    if (!movie) return null;

    return (
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        <div>
          <Label htmlFor="trailerUrl">Trailer URL</Label>
          <Input
            id="trailerUrl"
            name="trailerUrl"
            value={formData.trailerUrl || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="streamUrl">Stream URL</Label>
          <Input
            id="streamUrl"
            name="streamUrl"
            value={formData.streamUrl || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hasTrailer"
              checked={formData.hasTrailer || false}
              onCheckedChange={(checked) => handleSwitchChange('hasTrailer', checked)}
            />
            <Label htmlFor="hasTrailer">Hat Trailer</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="hasStream"
              checked={formData.hasStream || false}
              onCheckedChange={(checked) => handleSwitchChange('hasStream', checked)}
            />
            <Label htmlFor="hasStream">Hat Stream</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isFreeMovie"
              checked={formData.isFreeMovie || false}
              onCheckedChange={(checked) => handleSwitchChange('isFreeMovie', checked)}
            />
            <Label htmlFor="isFreeMovie">Kostenloser Film</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isNewTrailer"
              checked={formData.isNewTrailer || false}
              onCheckedChange={(checked) => handleSwitchChange('isNewTrailer', checked)}
            />
            <Label htmlFor="isNewTrailer">Neuer Trailer</Label>
          </div>
        </div>
      </form>
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
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MovieEditDialog;
