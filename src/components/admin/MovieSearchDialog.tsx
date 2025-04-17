import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { searchTMDBMovies, importMovieFromTMDB } from '@/lib/api';
import { fetchMovieFromTMDB } from '@/lib/cms/tmdbApi';
import { MovieOrShow } from '@/lib/types';
import { toast } from 'sonner';
import { Search, Import, Film } from 'lucide-react';

interface MovieSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

const MovieSearchDialog: React.FC<MovieSearchDialogProps> = ({ 
  open, 
  onOpenChange,
  onImportSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movieIdInput, setMovieIdInput] = useState('');
  const [searchResults, setSearchResults] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchTMDBMovies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for movies:', error);
      toast.error('Fehler bei der Filmsuche');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportById = async (e: React.FormEvent) => {
    e.preventDefault();
    const movieId = parseInt(movieIdInput);
    if (isNaN(movieId)) {
      toast.error('Bitte gib eine gültige Film-ID ein');
      return;
    }
    
    setIsImporting(true);
    try {
      toast.loading(`Filme mit ID ${movieId} wird importiert...`);
      const movieDetails = await fetchMovieFromTMDB(movieId);
      
      if (movieDetails) {
        await importMovie(movieDetails);
      } else {
        toast.dismiss();
        toast.error('Film konnte nicht gefunden werden');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      toast.dismiss();
      toast.error('Fehler beim Abrufen der Filmdetails');
    } finally {
      setIsImporting(false);
    }
  };

  const importMovie = async (movie: MovieOrShow) => {
    setIsImporting(true);
    try {
      toast.loading(`Film "${movie.title}" wird importiert...`);
      console.log("Importing movie:", movie);
      
      const success = await importMovieFromTMDB(movie);
      
      toast.dismiss();
      if (success) {
        toast.success('Film erfolgreich importiert');
        onImportSuccess();
        onOpenChange(false);
      } else {
        toast.error('Fehler beim Importieren des Films');
      }
    } catch (error) {
      console.error('Error importing movie:', error);
      toast.dismiss();
      toast.error('Fehler beim Importieren des Films');
    } finally {
      setIsImporting(false);
    }
  };

  const getPosterUrl = (path: string | undefined) => {
    if (!path) return '/placeholder.svg';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w200${path}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Film importieren</DialogTitle>
          <DialogDescription>
            Suche nach Filmen oder importiere einen Film direkt mit der TMDB-ID
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Import per TMDB-ID</h3>
            <form onSubmit={handleImportById} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="TMDB Film-ID eingeben"
                  value={movieIdInput}
                  onChange={(e) => setMovieIdInput(e.target.value)}
                  type="number"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isImporting || !movieIdInput}
                className="gap-2"
              >
                <Import size={16} />
                Importieren
              </Button>
            </form>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Film suchen</h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Filmtitel eingeben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !searchQuery.trim()}
                className="gap-2"
              >
                <Search size={16} />
                Suchen
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {searchResults.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="border rounded-md p-3 flex flex-col hover:bg-slate-50 cursor-pointer"
                    onClick={() => importMovie(movie)}
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-md mb-2">
                      <img 
                        src={getPosterUrl(movie.poster_path)} 
                        alt={movie.title || 'Movie Poster'} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <h4 className="font-medium line-clamp-2">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unbekanntes Jahr'}
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full gap-1"
                      variant="outline"
                      disabled={isImporting}
                    >
                      <Import size={14} />
                      Importieren
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {!isLoading && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8">
                <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Keine Filme gefunden</h3>
                <p className="text-muted-foreground">
                  Versuche es mit einem anderen Suchbegriff
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Schließen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MovieSearchDialog;
