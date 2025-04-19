
import { Film, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MovieOrShow } from "@/lib/types";

interface MovieGridProps {
  movies: MovieOrShow[];
  onEditMovie: (movie: MovieOrShow) => void;
  isLoading: boolean;
  searchQuery: string;
  currentView: 'all' | 'free' | 'trailers';
}

const MovieGrid = ({ 
  movies, 
  onEditMovie, 
  isLoading,
  searchQuery,
  currentView
}: MovieGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Lade Filme...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? 'Keine Filme gefunden.' : 
         currentView === 'free' ? 'Keine kostenlosen Filme markiert.' :
         currentView === 'trailers' ? 'Keine neuen Trailer markiert.' :
         'Keine Filme verfügbar.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {movies.map(movie => (
        <div 
          key={movie.id} 
          className="border border-border rounded-md p-4 hover:bg-muted/30 cursor-pointer transition-colors"
          onClick={() => onEditMovie(movie)}
        >
          <div className="flex items-start">
            <div className="w-16 h-24 bg-muted rounded overflow-hidden">
              {movie.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Film className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="ml-4 flex-grow">
              <h4 className="font-medium">{movie.title}</h4>
              <p className="text-sm text-muted-foreground">
                {movie.release_date?.substring(0, 4) || 'Unbekanntes Jahr'}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.hasStream && (
                  <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Stream verfügbar
                  </span>
                )}
                {movie.hasTrailer && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Trailer
                  </span>
                )}
                {movie.isFreeMovie && (
                  <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Kostenlos
                  </span>
                )}
                {movie.isNewTrailer && (
                  <span className="inline-block text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Neu
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;
