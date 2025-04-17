
import React from 'react';
import { MovieOrShow } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Film, Eye } from 'lucide-react';
import { getPosterPath } from '@/utils/imageUtils';

interface MovieListItemProps {
  movie: MovieOrShow;
  onEdit: (movie: MovieOrShow) => void;
  onDelete: (movie: MovieOrShow) => void;
  onView: (movie: MovieOrShow) => void;
}

const MovieListItem: React.FC<MovieListItemProps> = ({ movie, onEdit, onDelete, onView }) => {
  const posterUrl = getPosterPath(movie.poster_path);
  
  return (
    <div className="flex items-center p-3 border rounded-md bg-white mb-2 gap-3 hover:bg-slate-50 transition-colors">
      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded">
        <img 
          src={posterUrl || '/placeholder.svg'} 
          alt={movie.title || 'Movie poster'} 
          className="h-full w-full object-cover"
          onError={(e) => {
            console.error(`Image error for ${movie.title || 'unknown movie'}:`, movie.poster_path);
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm md:text-base truncate">{movie.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Jahr unbekannt'}</span>
          {movie.isFreeMovie && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Kostenlos</span>}
          {movie.isNewTrailer && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Neuer Trailer</span>}
        </div>
      </div>
      
      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(movie)}
          title="Film ansehen"
        >
          <Eye size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(movie)}
          title="Film bearbeiten"
        >
          <Edit size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(movie)}
          className="text-destructive hover:text-destructive"
          title="Film löschen"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </div>
  );
};

export default MovieListItem;
