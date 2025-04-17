
import React from 'react';
import { MovieOrShow } from '@/lib/types';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Star, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createUrlSlug } from '@/lib/urlUtils';

// MovieOrShow type is updated in MovieList.tsx to include runtime

interface MovieTableViewProps {
  movies: MovieOrShow[];
}

const MovieTableView = ({ movies }: MovieTableViewProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Bewertung</TableHead>
            <TableHead>Erscheinungsdatum</TableHead>
            <TableHead>Laufzeit</TableHead>
            <TableHead className="text-center">Trailer</TableHead>
            <TableHead className="text-center">Stream</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.map(movie => {
            const title = movie.title || 'Unbekannter Film';
            const slug = createUrlSlug(title);
            const movieUrl = `/film/${movie.id}/${slug}`;
            
            return (
              <TableRow key={movie.id}>
                <TableCell className="font-medium">{title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span>{movie.vote_average?.toFixed(1) || '?'}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(movie.release_date)}</TableCell>
                <TableCell>{movie.runtime ? `${movie.runtime} min` : 'Unbekannt'}</TableCell>
                <TableCell className="text-center">
                  {movie.hasTrailer ? (
                    <Check size={16} className="text-green-500 mx-auto" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {movie.hasStream ? (
                    <Check size={16} className="text-green-500 mx-auto" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" title="Film anzeigen">
                      <Link to={movieUrl}>
                        <Eye size={16} />
                      </Link>
                    </Button>
                    {movie.hasTrailer && movie.trailerUrl && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Trailer anschauen"
                        onClick={() => window.open(movie.trailerUrl, '_blank')}
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MovieTableView;
