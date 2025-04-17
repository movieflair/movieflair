import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteMovie, getAllMovies } from '@/lib/api';
import { MovieOrShow } from '@/lib/types';
import { toast } from 'sonner';
import { Plus, Search, Film, RefreshCw } from 'lucide-react';
import MovieSearchDialog from './MovieSearchDialog';
import MovieEditDialog from './MovieEditDialog';
import MovieListItem from './MovieListItem';
import DeleteMovieDialog from './DeleteMovieDialog';
import { createUrlSlug, getMediaTypeInGerman } from '@/lib/urlUtils';

const MovieCmsModule: React.FC = () => {
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieOrShow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieOrShow | null>(null);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const allMovies = await getAllMovies();
      setMovies(allMovies);
      setFilteredMovies(allMovies);
    } catch (error) {
      console.error('Error loading movies:', error);
      toast.error('Fehler beim Laden der Filme');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(movies);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = movies.filter(
      (movie) => movie.title?.toLowerCase().includes(query)
    );
    setFilteredMovies(filtered);
  }, [searchQuery, movies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };

  const handleEditMovie = (movie: MovieOrShow) => {
    setSelectedMovie(movie);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMovie = (movie: MovieOrShow) => {
    setSelectedMovie(movie);
    setIsDeleteDialogOpen(true);
  };

  const handleViewMovie = (movie: MovieOrShow) => {
    const title = movie.title || 'Unbekannter Film';
    const slug = createUrlSlug(title);
    const mediaType = getMediaTypeInGerman(movie.media_type);
    const url = `/${mediaType}/${movie.id}/${slug}`;
    window.open(url, '_blank');
  };

  const confirmDeleteMovie = async () => {
    if (!selectedMovie) return;
    
    try {
      toast.loading(`Film "${selectedMovie.title}" wird gelöscht...`);
      const success = await deleteMovie(selectedMovie.id);
      
      toast.dismiss();
      if (success) {
        toast.success(`Film "${selectedMovie.title}" wurde gelöscht`);
        loadMovies();
      } else {
        toast.error('Fehler beim Löschen des Films');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Fehler beim Löschen des Films');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Film Content Management</h2>
          <p className="text-gray-600">
            Verwalte deine Filmbibliothek
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsSearchDialogOpen(true)} 
            className="gap-2"
          >
            <Plus size={16} /> Film importieren
          </Button>
          <Button 
            variant="outline" 
            onClick={loadMovies} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Aktualisieren
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Filme durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">{filteredMovies.length} Filme gefunden</p>
      </div>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieListItem
              key={movie.id}
              movie={movie}
              onEdit={handleEditMovie}
              onDelete={handleDeleteMovie}
              onView={handleViewMovie}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Film size={48} className="mb-4" />
            {isLoading ? (
              <p>Filme werden geladen...</p>
            ) : searchQuery ? (
              <p>Keine Filme gefunden für "{searchQuery}"</p>
            ) : (
              <div className="text-center">
                <p className="mb-2">Keine Filme in deiner Bibliothek</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsSearchDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus size={16} /> Film importieren
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Dialogs */}
      <MovieSearchDialog 
        open={isSearchDialogOpen} 
        onOpenChange={setIsSearchDialogOpen} 
        onImportSuccess={loadMovies}
      />
      
      <MovieEditDialog 
        movie={selectedMovie} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        onUpdateSuccess={loadMovies}
      />
      
      <DeleteMovieDialog 
        movie={selectedMovie} 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDeleteMovie}
      />
    </div>
  );
};

export default MovieCmsModule;
