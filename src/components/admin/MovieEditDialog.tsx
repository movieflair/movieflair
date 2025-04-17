
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bilder-Vorschau */}
          <div className="space-y-2 col-span-full">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Poster</Label>
                <div className="relative w-32 h-48 border rounded overflow-hidden">
                  <img 
                    src={getImageUrl(posterPreview)} 
                    alt="Poster Vorschau" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePosterChange} 
                    className="w-32"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Hintergrundbild</Label>
                <div className="relative w-64 h-36 border rounded overflow-hidden">
                  <img 
                    src={getImageUrl(backdropPreview)} 
                    alt="Hintergrund Vorschau" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleBackdropChange}
                    className="w-64" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Hauptinfos */}
          <div className="space-y-2 col-span-full">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2 col-span-full">
            <Label htmlFor="overview">Beschreibung</Label>
            <Textarea
              id="overview"
              name="overview"
              value={formData.overview || ''}
              onChange={handleInputChange}
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="release_date">Veröffentlichungsdatum</Label>
            <Input
              id="release_date"
              name="release_date"
              value={formData.release_date || ''}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vote_average">Bewertung</Label>
            <Input
              id="vote_average"
              name="vote_average"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.vote_average || 0}
              onChange={handleNumberInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="popularity">Popularität</Label>
            <Input
              id="popularity"
              name="popularity"
              type="number"
              min="0"
              step="0.1"
              value={formData.popularity || 0}
              onChange={handleNumberInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vote_count">Anzahl Bewertungen</Label>
            <Input
              id="vote_count"
              name="vote_count"
              type="number"
              min="0"
              value={formData.vote_count || 0}
              onChange={handleNumberInputChange}
            />
          </div>
          
          {/* Video URLs */}
          <div className="space-y-2 col-span-full">
            <Label htmlFor="trailerUrl">Trailer URL</Label>
            <Input
              id="trailerUrl"
              name="trailerUrl"
              value={formData.trailerUrl || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2 col-span-full">
            <Label htmlFor="streamUrl">Stream URL</Label>
            <Input
              id="streamUrl"
              name="streamUrl"
              value={formData.streamUrl || ''}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Schalter */}
          <div className="grid grid-cols-2 gap-4 col-span-full">
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
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
};

export default MovieEditDialog;
