
import { Edit, Film } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MovieOrShow } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminMovieListProps {
  movies: MovieOrShow[];
  onEditMovie: (movie: MovieOrShow) => void;
  isLoading: boolean;
  searchQuery: string;
  currentView: 'all' | 'free' | 'trailers';
}

const AdminMovieList = ({ 
  movies, 
  onEditMovie, 
  isLoading,
  searchQuery,
  currentView
}: AdminMovieListProps) => {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Jahr</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.map((movie) => (
            <TableRow key={movie.id}>
              <TableCell className="font-medium">{movie.id}</TableCell>
              <TableCell>{movie.title}</TableCell>
              <TableCell>{movie.release_date?.substring(0, 4) || 'Unbekannt'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {movie.hasStream && (
                    <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Stream
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
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEditMovie(movie)}
                >
                  <Edit className="w-4 h-4" />
                  <span className="sr-only">Bearbeiten</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminMovieList;
