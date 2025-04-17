
import React from 'react';
import { MovieOrShow } from '@/lib/types';
import { ImportIcon, Edit, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MovieGridProps {
  movies: MovieOrShow[];
  onEditMovie: (movie: MovieOrShow) => void;
  isLoading: boolean;
  searchQuery: string;
  currentView: 'all' | 'free' | 'trailers';
  onImportMovie?: (movie: MovieOrShow) => Promise<void>; 
}

const MovieGrid = ({ 
  movies, 
  onEditMovie, 
  isLoading, 
  searchQuery, 
  currentView,
  onImportMovie 
}: MovieGridProps) => {

  // Hilfsfunktion zum Prüfen, ob ein Film bereits importiert wurde
  const isMovieImported = async (movieId: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_movies')
        .select('id')
        .eq('id', movieId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking if movie is imported:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if movie is imported:', error);
      return false;
    }
  };

  // Hilfsfunktion zum direkten Importieren eines Films
  const handleImportMovie = async (movie: MovieOrShow) => {
    try {
      const alreadyImported = await isMovieImported(movie.id);
      
      if (alreadyImported) {
        toast.info('Film bereits importiert');
        return;
      }
      
      if (onImportMovie) {
        await onImportMovie(movie);
        toast.success('Film erfolgreich importiert');
      }
    } catch (error) {
      console.error('Error importing movie:', error);
      toast.error('Fehler beim Importieren des Films');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-[2/3] rounded-md"></div>
            <div className="h-4 bg-gray-200 rounded mt-2"></div>
            <div className="h-3 bg-gray-200 rounded mt-2 w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-10">
        <Ban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {searchQuery 
            ? `Keine Ergebnisse für "${searchQuery}"`
            : currentView === 'free'
              ? 'Keine kostenlosen Filme verfügbar'
              : currentView === 'trailers'
                ? 'Keine Filme mit Trailern verfügbar'
                : 'Keine Filme verfügbar'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <div key={movie.id} className="group relative">
          <div className="aspect-[2/3] bg-gray-100 rounded-md overflow-hidden">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title || movie.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500 text-sm">Kein Bild</span>
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <h4 className="text-white text-sm font-medium truncate">
              {movie.title || movie.name}
            </h4>
            <p className="text-gray-300 text-xs">
              {movie.release_date?.substring(0, 4) || 'Unbekanntes Jahr'}
            </p>
            
            <div className="flex mt-2 space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 bg-white/20 hover:bg-white/30 border-none text-white"
                onClick={() => onEditMovie(movie)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Bearbeiten
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 bg-white/20 hover:bg-white/30 border-none text-white"
                onClick={() => handleImportMovie(movie)}
              >
                <ImportIcon className="h-4 w-4 mr-1" />
                Importieren
              </Button>
            </div>
          </div>
          
          <h4 className="text-sm font-medium truncate mt-1">
            {movie.title || movie.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {movie.release_date?.substring(0, 4) || 'Unbekanntes Jahr'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;
