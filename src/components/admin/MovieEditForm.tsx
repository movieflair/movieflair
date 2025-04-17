
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MovieOrShow } from "@/lib/types";
import { LinkIcon, PlayCircle, Image, Upload, Download } from "lucide-react";
import MovieCategories from "./MovieCategories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MovieEditFormProps {
  selectedMovie: MovieOrShow;
  isNewTrailer: boolean;
  isFreeMovie: boolean;
  streamUrl: string;
  streamType: 'embed' | 'link';
  trailerUrl: string;
  onTrailerChange: (checked: boolean) => void;
  onFreeMovieChange: (checked: boolean) => void;
  setStreamType: (type: 'embed' | 'link') => void;
  setStreamUrl: (url: string) => void;
  setTrailerUrl: (url: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const MovieEditForm = ({
  selectedMovie,
  isNewTrailer,
  isFreeMovie,
  streamUrl,
  streamType,
  trailerUrl,
  onTrailerChange,
  onFreeMovieChange,
  setStreamType,
  setStreamUrl,
  setTrailerUrl,
  onSave,
  onCancel,
}: MovieEditFormProps) => {
  const [title, setTitle] = useState(selectedMovie.title || '');
  const [overview, setOverview] = useState(selectedMovie.overview || '');
  const [posterPath, setPosterPath] = useState(selectedMovie.poster_path || '');
  const [backdropPath, setBackdropPath] = useState(selectedMovie.backdrop_path || '');
  const [releaseDate, setReleaseDate] = useState(selectedMovie.release_date || '');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);

  // Handle poster file upload
  const handlePosterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingPoster(true);
      toast.loading('Poster wird hochgeladen...');
      
      const { data, error } = await supabase.storage
        .from('movie_images')
        .upload(`posters/${selectedMovie.id}_${Date.now()}.jpg`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading poster:', error);
        toast.dismiss();
        toast.error('Fehler beim Hochladen des Posters');
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('movie_images')
        .getPublicUrl(data.path);
      
      setPosterPath(urlData.publicUrl);
      
      toast.dismiss();
      toast.success('Poster erfolgreich hochgeladen');
    } catch (error) {
      console.error('Error uploading poster:', error);
      toast.dismiss();
      toast.error('Fehler beim Hochladen des Posters');
    } finally {
      setUploadingPoster(false);
    }
  };

  // Handle backdrop file upload
  const handleBackdropUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingBackdrop(true);
      toast.loading('Hintergrundbild wird hochgeladen...');
      
      const { data, error } = await supabase.storage
        .from('movie_images')
        .upload(`backdrops/${selectedMovie.id}_${Date.now()}.jpg`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading backdrop:', error);
        toast.dismiss();
        toast.error('Fehler beim Hochladen des Hintergrundbilds');
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('movie_images')
        .getPublicUrl(data.path);
      
      setBackdropPath(urlData.publicUrl);
      
      toast.dismiss();
      toast.success('Hintergrundbild erfolgreich hochgeladen');
    } catch (error) {
      console.error('Error uploading backdrop:', error);
      toast.dismiss();
      toast.error('Fehler beim Hochladen des Hintergrundbilds');
    } finally {
      setUploadingBackdrop(false);
    }
  };

  // Function to download remote images to local server
  const downloadImagesToServer = async () => {
    try {
      if (!selectedMovie.poster_path && !selectedMovie.backdrop_path) {
        toast.error('Keine Bilder zum Herunterladen vorhanden');
        return;
      }
      
      toast.loading('Bilder werden auf den Server geladen...');
      
      // Download poster image
      if (selectedMovie.poster_path && selectedMovie.poster_path.startsWith('https://image.tmdb.org')) {
        const posterUrl = `https://image.tmdb.org/t/p/original${selectedMovie.poster_path.replace('https://image.tmdb.org/t/p/w500', '')}`;
        
        const posterRes = await fetch(posterUrl);
        const posterBlob = await posterRes.blob();
        
        const posterFile = new File([posterBlob], `movie_${selectedMovie.id}_poster.jpg`, { 
          type: 'image/jpeg' 
        });
        
        const { data: posterData, error: posterError } = await supabase.storage
          .from('movie_images')
          .upload(`posters/${selectedMovie.id}.jpg`, posterFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (posterError) {
          console.error('Error uploading poster:', posterError);
        } else {
          const { data: urlData } = supabase.storage
            .from('movie_images')
            .getPublicUrl(posterData.path);
          
          setPosterPath(urlData.publicUrl);
        }
      }
      
      // Download backdrop image
      if (selectedMovie.backdrop_path && selectedMovie.backdrop_path.startsWith('https://image.tmdb.org')) {
        const backdropUrl = `https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path.replace('https://image.tmdb.org/t/p/w500', '')}`;
        
        const backdropRes = await fetch(backdropUrl);
        const backdropBlob = await backdropRes.blob();
        
        const backdropFile = new File([backdropBlob], `movie_${selectedMovie.id}_backdrop.jpg`, { 
          type: 'image/jpeg' 
        });
        
        const { data: backdropData, error: backdropError } = await supabase.storage
          .from('movie_images')
          .upload(`backdrops/${selectedMovie.id}.jpg`, backdropFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (backdropError) {
          console.error('Error uploading backdrop:', backdropError);
        } else {
          const { data: urlData } = supabase.storage
            .from('movie_images')
            .getPublicUrl(backdropData.path);
          
          setBackdropPath(urlData.publicUrl);
        }
      }
      
      toast.dismiss();
      toast.success('Bilder erfolgreich auf den Server geladen');
    } catch (error) {
      console.error('Error downloading images to server:', error);
      toast.dismiss();
      toast.error('Fehler beim Herunterladen der Bilder');
    }
  };
  
  // Check if images are from TMDB and show download button if needed
  const hasTmdbImages = 
    (selectedMovie.poster_path && selectedMovie.poster_path.includes('tmdb.org')) || 
    (selectedMovie.backdrop_path && selectedMovie.backdrop_path.includes('tmdb.org'));

  return (
    <div className="border border-border rounded-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Film bearbeiten: {selectedMovie.title}</h3>
        <Button variant="ghost" onClick={onCancel} className="text-sm">
          Zurück zur Liste
        </Button>
      </div>

      {hasTmdbImages && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-amber-800 text-sm">
              Dieser Film verwendet Bilder von TMDB. Um sie auf deinen Server zu laden, klicke auf den Button.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadImagesToServer}
              className="ml-4 bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
            >
              <Download className="h-4 w-4 mr-1" />
              Bilder auf Server laden
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            placeholder="Fight Club"
            className="mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="year">Jahr</Label>
          <Input
            id="year"
            placeholder="1999"
            className="mt-1"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Beschreibung</Label>
          <textarea
            id="description"
            rows={3}
            className="w-full mt-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Film Beschreibung..."
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="posterPath" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Poster URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="posterPath"
              placeholder="/path/to/poster.jpg"
              className="mt-1"
              value={posterPath}
              onChange={(e) => setPosterPath(e.target.value)}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="mt-1" 
              onClick={() => posterInputRef.current?.click()}
              disabled={uploadingPoster}
            >
              {uploadingPoster ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Lädt...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </span>
              )}
            </Button>
            <input 
              type="file" 
              ref={posterInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePosterUpload} 
            />
          </div>
          {posterPath && (
            <div className="mt-2">
              <img 
                src={posterPath} 
                alt="Poster Vorschau" 
                className="w-32 h-auto rounded-md border border-border"
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="backdropPath" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Hintergrundbild URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="backdropPath"
              placeholder="/path/to/backdrop.jpg"
              className="mt-1"
              value={backdropPath}
              onChange={(e) => setBackdropPath(e.target.value)}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="mt-1" 
              onClick={() => backdropInputRef.current?.click()}
              disabled={uploadingBackdrop}
            >
              {uploadingBackdrop ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Lädt...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </span>
              )}
            </Button>
            <input 
              type="file" 
              ref={backdropInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBackdropUpload} 
            />
          </div>
          {backdropPath && (
            <div className="mt-2">
              <img 
                src={backdropPath} 
                alt="Hintergrundbild Vorschau" 
                className="w-full h-auto rounded-md border border-border"
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <MovieCategories
            isNewTrailer={isNewTrailer}
            isFreeMovie={isFreeMovie}
            onTrailerChange={onTrailerChange}
            onFreeMovieChange={onFreeMovieChange}
          />
        </div>

        {isFreeMovie && (
          <div className="md:col-span-2 space-y-4">
            <div>
              <Label className="mb-2 block">Stream URL Typ</Label>
              <RadioGroup
                value={streamType}
                onValueChange={(value) => setStreamType(value as 'embed' | 'link')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="embed" id="embed" />
                  <Label htmlFor="embed" className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    Embed Code (Video Player)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="link" />
                  <Label htmlFor="link" className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    Direkt-Link (Weiterleitung)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="streamUrl">
                {streamType === 'embed' ? 'Stream URL (Embed Code)' : 'Stream URL (Direktlink)'}
              </Label>
              <Input
                id="streamUrl"
                placeholder={streamType === 'embed'
                  ? "https://www.youtube.com/embed/..."
                  : "https://www.example.com/watch?..."
                }
                className="mt-1"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        {isNewTrailer && (
          <div className="md:col-span-2">
            <Label htmlFor="trailerUrl">Trailer URL (YouTube Embed)</Label>
            <Input
              id="trailerUrl"
              placeholder="https://www.youtube.com/embed/..."
              className="mt-1"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
            />
            {trailerUrl && (
              <div className="mt-2 aspect-video">
                <iframe 
                  src={trailerUrl} 
                  title="Trailer Vorschau"
                  className="w-full h-full rounded-md border border-border"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={() => {
          // Update selectedMovie with new values
          selectedMovie.title = title;
          selectedMovie.overview = overview;
          selectedMovie.poster_path = posterPath;
          selectedMovie.backdrop_path = backdropPath;
          selectedMovie.release_date = releaseDate;
          
          onSave();
        }}>
          Speichern
        </Button>
      </div>
    </div>
  );
};

export default MovieEditForm;
