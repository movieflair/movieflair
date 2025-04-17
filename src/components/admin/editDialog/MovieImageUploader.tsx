
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MovieImageUploaderProps {
  posterFile: File | null;
  setPosterFile: React.Dispatch<React.SetStateAction<File | null>>;
  backdropFile: File | null;
  setBackdropFile: React.Dispatch<React.SetStateAction<File | null>>;
  posterPreview: string;
  setPosterPreview: React.Dispatch<React.SetStateAction<string>>;
  backdropPreview: string;
  setBackdropPreview: React.Dispatch<React.SetStateAction<string>>;
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

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '/placeholder.svg';
    if (path.startsWith('/storage')) return path;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
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
  );
};

export default MovieImageUploader;
