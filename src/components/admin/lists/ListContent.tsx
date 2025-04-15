
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomList, MovieOrShow } from '@/lib/api';
import { Edit, Film, Save, X, Trash2 } from 'lucide-react';

interface ListContentProps {
  list: CustomList;
  isEditing: boolean;
  listTitle: string;
  listDescription: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
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
  onRemoveMovie
}: ListContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        {isEditing ? (
          <div className="space-y-3 w-full">
            <Input
              value={listTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Listentitel"
              className="text-lg font-medium"
            />
            <Textarea
              value={listDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Listenbeschreibung"
              className="min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Button onClick={onSave} className="flex items-center gap-1">
                <Save size={16} />
                Speichern
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex items-center gap-1">
                <X size={16} />
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-2">{list.title}</h2>
              <p className="text-muted-foreground">{list.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1">
              <Edit size={16} />
              Bearbeiten
            </Button>
          </>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Inhalte in dieser Liste ({list.movies.length})</h3>
        {list.movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onRemove={onRemoveMovie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Keine Inhalte in dieser Liste</p>
            <p className="text-sm">Suche nach Filmen oder Serien, um sie hinzuzufügen</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface MovieCardProps {
  movie: MovieOrShow;
  onRemove: (movieId: number) => void;
}

const MovieCard = ({ movie, onRemove }: MovieCardProps) => (
  <div className="relative group rounded-md overflow-hidden">
    <div className="aspect-[2/3] bg-muted">
      {movie.poster_path ? (
        <img 
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title || movie.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Film className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => onRemove(movie.id)}
        className="flex items-center gap-1"
      >
        <Trash2 size={16} />
        Entfernen
      </Button>
    </div>
    <p className="text-sm mt-1 truncate">{movie.title || movie.name}</p>
    <p className="text-xs text-muted-foreground">
      {movie.media_type === 'movie' ? 'Film' : 'Serie'}
    </p>
  </div>
);

export default ListContent;
