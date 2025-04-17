
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MovieOrShow } from '@/lib/types';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import MovieImageUploader from './MovieImageUploader';

interface MovieEditFormProps {
  movie: MovieOrShow | null;
  onSubmit: (e: React.FormEvent) => void;
  formData: Partial<MovieOrShow>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MovieOrShow>>>;
  isSaving: boolean;
  posterFile: File | null;
  setPosterFile: React.Dispatch<React.SetStateAction<File | null>>;
  backdropFile: File | null;
  setBackdropFile: React.Dispatch<React.SetStateAction<File | null>>;
  posterPreview: string;
  setPosterPreview: React.Dispatch<React.SetStateAction<string>>;
  backdropPreview: string;
  setBackdropPreview: React.Dispatch<React.SetStateAction<string>>;
}

const MovieEditForm: React.FC<MovieEditFormProps> = ({
  movie,
  onSubmit,
  formData,
  setFormData,
  isSaving,
  posterFile,
  setPosterFile,
  backdropFile,
  setBackdropFile,
  posterPreview,
  setPosterPreview,
  backdropPreview,
  setBackdropPreview
}) => {
  if (!movie) return null;

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

  return (
    <form onSubmit={onSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Preview Section */}
        <div className="space-y-2 col-span-full">
          <MovieImageUploader
            posterFile={posterFile}
            setPosterFile={setPosterFile}
            backdropFile={backdropFile}
            setBackdropFile={setBackdropFile}
            posterPreview={posterPreview}
            setPosterPreview={setPosterPreview}
            backdropPreview={backdropPreview}
            setBackdropPreview={setBackdropPreview}
          />
        </div>
        
        {/* Main Info */}
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
        
        {/* Runtime field */}
        <div className="space-y-2">
          <Label htmlFor="runtime">Laufzeit (Minuten)</Label>
          <Input
            id="runtime"
            name="runtime"
            type="number"
            min="0"
            value={formData.runtime || 0}
            onChange={handleNumberInputChange}
            placeholder="z.B. 120"
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
        
        {/* Switches */}
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

export default MovieEditForm;
