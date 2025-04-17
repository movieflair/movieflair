
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeImagePath } from '@/utils/imageUtils';

interface MovieImageUploaderProps {
  posterFile: File | null;
  setPosterFile: React.Dispatch<React.SetStateAction<File | null>>;
  backdropFile: File | null;
  setBackdropFile: React.Dispatch<React.SetStateAction<File | null>>;
  posterPreview: string | null;
  setPosterPreview: React.Dispatch<React.SetStateAction<string | null>>;
  backdropPreview: string | null;
  setBackdropPreview: React.Dispatch<React.SetStateAction<string | null>>;
}

const MovieImageUploader: React.FC<MovieImageUploaderProps> = ({
  posterFile,
  setPosterFile,
  backdropFile,
  setBackdropFile,
  posterPreview,
  setPosterPreview,
  backdropPreview,
  setBackdropPreview
}) => {
  const [posterError, setPosterError] = useState<string | null>(null);
  const [backdropError, setBackdropError] = useState<string | null>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosterError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Größenlimit prüfen (10 MB)
      if (file.size > 10 * 1024 * 1024) {
        setPosterError("Bild ist zu groß (max. 10 MB)");
        return;
      }
      
      // Typ prüfen
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setPosterError("Nur JPG, PNG oder WEBP erlaubt");
        return;
      }
      
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleBackdropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackdropError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Größenlimit prüfen (10 MB)
      if (file.size > 10 * 1024 * 1024) {
        setBackdropError("Bild ist zu groß (max. 10 MB)");
        return;
      }
      
      // Typ prüfen
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setBackdropError("Nur JPG, PNG oder WEBP erlaubt");
        return;
      }
      
      setBackdropFile(file);
      setBackdropPreview(URL.createObjectURL(file));
    }
  };

  const getDisplayImageUrl = (path: string | null): string => {
    if (!path) return '/placeholder.svg';
    return normalizeImagePath(path) || '/placeholder.svg';
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="space-y-2">
        <Label>Poster</Label>
        <div className="relative w-32 h-48 border rounded overflow-hidden">
          <img 
            src={getDisplayImageUrl(posterPreview)} 
            alt="Poster Vorschau" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <Input 
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={handlePosterChange} 
            className="w-32"
          />
          {posterError && <p className="text-xs text-red-500 mt-1">{posterError}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Hintergrundbild</Label>
        <div className="relative w-64 h-36 border rounded overflow-hidden">
          <img 
            src={getDisplayImageUrl(backdropPreview)} 
            alt="Hintergrund Vorschau" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <Input 
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={handleBackdropChange}
            className="w-64" 
          />
          {backdropError && <p className="text-xs text-red-500 mt-1">{backdropError}</p>}
        </div>
      </div>
    </div>
  );
};

export default MovieImageUploader;
