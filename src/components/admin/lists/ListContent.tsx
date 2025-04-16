
import { Link } from 'react-router-dom';
import { Edit2, Save, X } from 'lucide-react';
import { CustomList } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createUrlSlug } from '@/lib/urlUtils';
import MovieCard from '@/components/movies/MovieCard';

interface ListContentProps {
  list: CustomList;
  isEditing: boolean;
  listTitle: string;
  listDescription: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onRemoveMovie: (movieId: number) => void;
}

const ListContent = ({
  list,
  isEditing,
  listTitle,
  listDescription,
  onTitleChange,
  onDescriptionChange,
  onEdit,
  onSave,
  onCancel,
  onRemoveMovie,
}: ListContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          {isEditing ? (
            <>
              <Input
                value={listTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Listentitel"
                className="text-xl font-semibold"
              />
              <Textarea
                value={listDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Listenbeschreibung (optional)"
                className="h-24"
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{list.title}</h3>
                <Link 
                  to={`/liste/${createUrlSlug(list.title)}`} 
                  target="_blank" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Öffnen
                </Link>
              </div>
              {list.description && (
                <p className="text-sm text-muted-foreground">{list.description}</p>
              )}
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={onSave} size="sm" className="flex items-center gap-1">
                <Save size={16} />
                Speichern
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm" className="flex items-center gap-1">
                <X size={16} />
                Abbrechen
              </Button>
            </>
          ) : (
            <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-1">
              <Edit2 size={16} />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {list.movies.map((movie) => (
          <div key={movie.id} className="relative group">
            <MovieCard movie={movie} size="small" />
            <button
              onClick={() => onRemoveMovie(movie.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListContent;
