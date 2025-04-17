
import React, { useState, useEffect } from 'react';
import { MovieOrShow } from '@/lib/types';
import { ImportIcon, Edit, Ban, Loader, Download, Info } from 'lucide-react';
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
  const [importingIds, setImportingIds] = useState<number[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<number[]>([]);
  const [totalImportedMovies, setTotalImportedMovies] = useState<number>(0);

  useEffect(() => {
    // Fetch the total count of imported movies when component mounts
    const fetchTotalImportedMovies = async () => {
      try {
        const { count, error } = await supabase
          .from('admin_movies')
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error counting imported movies:', error);
          return;
        }

        setTotalImportedMovies(count || 0);
      } catch (error) {
        console.error('Error counting imported movies:', error);
      }
    };

    fetchTotalImportedMovies();
  }, [movies]);

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
      if (importingIds.includes(movie.id)) {
        return; // Bereits dabei zu importieren
      }
      
      setImportingIds(prev => [...prev, movie.id]);
      
      const alreadyImported = await isMovieImported(movie.id);
      
      if (alreadyImported) {
        toast.info('Film bereits importiert');
        setImportingIds(prev => prev.filter(id => id !== movie.id));
        return;
      }
      
      if (onImportMovie) {
        await onImportMovie(movie);
        // Update total count after successful import
        setTotalImportedMovies(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error importing movie:', error);
      toast.error('Fehler beim Importieren des Films');
    } finally {
      setImportingIds(prev => prev.filter(id => id !== movie.id));
    }
  };

  // Function to download movie images to server
  const handleDownloadImages = async (movie: MovieOrShow) => {
    try {
      if (downloadingIds.includes(movie.id)) {
        return; // Already downloading
      }
      
      setDownloadingIds(prev => [...prev, movie.id]);
      
      // Download poster image
      if (movie.poster_path) {
        const posterUrl = movie.poster_path.startsWith('http') 
          ? movie.poster_path 
          : `https://image.tmdb.org/t/p/original${movie.poster_path}`;
        
        const posterRes = await fetch(posterUrl);
        const posterBlob = await posterRes.blob();
        
        const posterFile = new File([posterBlob], `movie_${movie.id}_poster.jpg`, { 
          type: 'image/jpeg' 
        });
        
        const { error: posterError } = await supabase.storage
          .from('movie_images')
          .upload(`posters/${movie.id}.jpg`, posterFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (posterError) {
          console.error('Error uploading poster:', posterError);
          toast.error('Fehler beim Hochladen des Posters');
        }
      }
      
      // Download backdrop image
      if (movie.backdrop_path) {
        const backdropUrl = movie.backdrop_path.startsWith('http') 
          ? movie.backdrop_path 
          : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        
        const backdropRes = await fetch(backdropUrl);
        const backdropBlob = await backdropRes.blob();
        
        const backdropFile = new File([backdropBlob], `movie_${movie.id}_backdrop.jpg`, { 
          type: 'image/jpeg' 
        });
        
        const { error: backdropError } = await supabase.storage
          .from('movie_images')
          .upload(`backdrops/${movie.id}.jpg`, backdropFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (backdropError) {
          console.error('Error uploading backdrop:', backdropError);
          toast.error('Fehler beim Hochladen des Hintergrundbilds');
        }
      }
      
      // Update the movie in database with the new paths
      const { error: updateError } = await supabase
        .from('admin_movies')
        .update({
          poster_path: movie.poster_path ? `/storage/movie_images/posters/${movie.id}.jpg` : movie.poster_path,
          backdrop_path: movie.backdrop_path ? `/storage/movie_images/backdrops/${movie.id}.jpg` : movie.backdrop_path
        })
        .eq('id', movie.id);
      
      if (updateError) {
        console.error('Error updating movie with local paths:', updateError);
        toast.error('Fehler beim Aktualisieren der Bildpfade');
      } else {
        toast.success('Bilder erfolgreich importiert');
      }
      
    } catch (error) {
      console.error('Error downloading images:', error);
      toast.error('Fehler beim Herunterladen der Bilder');
    } finally {
      setDownloadingIds(prev => prev.filter(id => id !== movie.id));
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

  const ImportedMoviesInfo = () => (
    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
      <Info className="h-4 w-4" />
      <span>Importierte Filme: <strong>{totalImportedMovies}</strong></span>
    </div>
  );

  if (movies.length === 0) {
    return (
      <div>
        <ImportedMoviesInfo />
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
      </div>
    );
  }

  return (
    <div>
      <ImportedMoviesInfo />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <div className="aspect-[2/3] bg-gray-100 rounded-md overflow-hidden">
              {movie.poster_path ? (
                <img 
                  src={movie.poster_path.startsWith('http') || movie.poster_path.startsWith('/storage')
                    ? movie.poster_path 
                    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
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
                
                {/* Only show import button if movie isn't already imported, or show download images button if movie is imported */}
                {!movie.isImported ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 bg-white/20 hover:bg-white/30 border-none text-white"
                    onClick={() => handleImportMovie(movie)}
                    disabled={importingIds.includes(movie.id)}
                  >
                    {importingIds.includes(movie.id) ? (
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <ImportIcon className="h-4 w-4 mr-1" />
                    )}
                    {importingIds.includes(movie.id) ? 'Wird importiert...' : 'Importieren'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 bg-white/20 hover:bg-white/30 border-none text-white"
                    onClick={() => handleDownloadImages(movie)}
                    disabled={downloadingIds.includes(movie.id)}
                  >
                    {downloadingIds.includes(movie.id) ? (
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    {downloadingIds.includes(movie.id) ? 'Bilder werden importiert...' : 'Bilder importieren'}
                  </Button>
                )}
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
    </div>
  );
};

export default MovieGrid;
