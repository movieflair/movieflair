import { useState } from 'react';
import { toast } from "sonner";
import { Search, Plus, Check } from 'lucide-react';
import { searchMovies, searchTvShows, MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MediaSearchProps {
  onAddMedia: (media: MovieOrShow) => void;
  selectedListId: string;
  existingMediaIds: number[];
}

const MediaSearch = ({ onAddMedia, selectedListId, existingMediaIds }: MediaSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const movieResults = await searchMovies(searchQuery);
      const tvShowResults = await searchTvShows(searchQuery);
      
      // Combine and deduplicate results
      const combinedResults = [...movieResults, ...tvShowResults].reduce((acc: MovieOrShow[], item: MovieOrShow) => {
        if (!acc.find(i => i.id === item.id)) {
          acc.push(item);
        }
        return acc;
      }, []);

      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Error searching media:', error);
      toast.error('Fehler bei der Suche nach Medien');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Filme oder Serien suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              Suche...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Suche
            </>
          )}
        </Button>
      </form>
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {searchResults.map((media) => {
            const isAlreadyAdded = existingMediaIds.includes(media.id);
            
            return (
              <div key={media.id} className="relative group">
                <MovieCard movie={media} size="small" />
                <button
                  onClick={() => !isAlreadyAdded && onAddMedia(media)}
                  disabled={isAlreadyAdded}
                  className={`absolute top-2 right-2 p-1 rounded-full transition-opacity
                    ${isAlreadyAdded 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-green-500 opacity-0 group-hover:opacity-100 hover:bg-green-600'
                    } text-white`}
                >
                  {isAlreadyAdded ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {isLoading && (
        <div className="text-center">Suche läuft...</div>
      )}
      
      {!isLoading && searchQuery.trim() !== '' && searchResults.length === 0 && (
        <div className="text-center text-muted-foreground">
          Keine Ergebnisse gefunden.
        </div>
      )}
    </div>
  );
};

export default MediaSearch;
