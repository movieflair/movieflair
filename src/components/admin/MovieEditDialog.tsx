
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

  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Film bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeite die Informationen für "{movie.title}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Filmtitel</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="release_date">Erscheinungsdatum</Label>
                <Input
                  id="release_date"
                  name="release_date"
                  value={formData.release_date || ''}
                  onChange={handleInputChange}
                  placeholder="YYYY-MM-DD"
                />
              </div>
              
              <div>
                <Label htmlFor="overview">Beschreibung</Label>
                <Textarea
                  id="overview"
                  name="overview"
                  value={formData.overview || ''}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vote_average">Bewertung</Label>
                  <Input
                    id="vote_average"
                    name="vote_average"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.vote_average || 0}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vote_count">Anzahl der Bewertungen</Label>
                  <Input
                    id="vote_count"
                    name="vote_count"
                    type="number"
                    min="0"
                    value={formData.vote_count || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="trailerurl">Trailer URL (YouTube Embed)</Label>
                <Input
                  id="trailerurl"
                  name="trailerurl"
                  value={formData.trailerurl || ''}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              
              <div>
                <Label htmlFor="streamurl">Stream URL</Label>
                <Input
                  id="streamurl"
                  name="streamurl"
                  value={formData.streamurl || ''}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hastrailer"
                    checked={formData.hastrailer || false}
                    onCheckedChange={(checked) => handleSwitchChange('hastrailer', checked)}
                  />
                  <Label htmlFor="hastrailer">Hat Trailer</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasstream"
                    checked={formData.hasstream || false}
                    onCheckedChange={(checked) => handleSwitchChange('hasstream', checked)}
                  />
                  <Label htmlFor="hasstream">Hat Stream</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isfreemovie"
                    checked={formData.isfreemovie || false}
                    onCheckedChange={(checked) => handleSwitchChange('isfreemovie', checked)}
                  />
                  <Label htmlFor="isfreemovie">Kostenloser Film</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isnewtrailer"
                    checked={formData.isnewtrailer || false}
                    onCheckedChange={(checked) => handleSwitchChange('isnewtrailer', checked)}
                  />
                  <Label htmlFor="isnewtrailer">Neuer Trailer</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Filmposter</Label>
                <div className="mb-2 border rounded-md overflow-hidden aspect-[2/3] relative">
                  <img 
                    src={posterPreview || getImageUrl(movie.poster_path)} 
                    alt="Movie Poster" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                    <label className="cursor-pointer">
                      <div className="bg-white text-black rounded-full p-2">
                        <Upload size={24} />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePosterChange}
                      />
                    </label>
                  </div>
                </div>
                <label className="block">
                  <Button type="button" variant="outline" className="w-full gap-2">
                    <Upload size={16} /> Poster hochladen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterChange}
                    />
                  </Button>
                </label>
              </div>
              
              <div>
                <Label className="block mb-2">Hintergrundbild</Label>
                <div className="mb-2 border rounded-md overflow-hidden aspect-video relative">
                  <img 
                    src={backdropPreview || getImageUrl(movie.backdrop_path)} 
                    alt="Movie Backdrop" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                    <label className="cursor-pointer">
                      <div className="bg-white text-black rounded-full p-2">
                        <Upload size={24} />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackdropChange}
                      />
                    </label>
                  </div>
                </div>
                <label className="block">
                  <Button type="button" variant="outline" className="w-full gap-2">
                    <Upload size={16} /> Hintergrundbild hochladen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBackdropChange}
                    />
                  </Button>
                </label>
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
      </DialogContent>
    </Dialog>
  );
};

export default MovieEditDialog;
