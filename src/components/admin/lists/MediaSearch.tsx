import { useState } from 'react';
import { Search, Film, Tv, Check, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieOrShow } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { searchMovies, searchTvShows } from '@/lib/api';
import { toast } from "sonner";

interface MediaSearchProps {
  onAddMedia: (media: MovieOrShow) => void;
  selectedListId: string | null;
  existingMediaIds: number[];
}

const MediaSearch = ({ onAddMedia, selectedListId, existingMediaIds }: MediaSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');
  const [isSearching, setIsSearching] = useState(false);

  const { data: movieResults = [], refetch: refetchMovies } = useQuery({
    queryKey: ['search-movies-for-list', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: false,
  });

  const { data: tvResults = [], refetch: refetchTvShows } = useQuery({
    queryKey: ['search-tv-shows-for-list', searchQuery],
    queryFn: () => searchTvShows(searchQuery),
    enabled: false,
  });

  const searchResults = searchType === 'movie' ? movieResults : tvResults;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        if (searchType === 'movie') {
          await refetchMovies();
        } else {
          await refetchTvShows();
        }
      } catch (error) {
        console.error('Fehler bei der Suche:', error);
        toast.error('Fehler bei der Suche');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleAddMedia = (media: MovieOrShow) => {
    if (selectedListId) {
      // Make sure media.media_type is set
      const mediaWithType = {
        ...media,
        media_type: media.media_type || searchType
      };
      
      onAddMedia(mediaWithType);
      toast.success(`${media.title || media.name} wurde zur Liste hinzugefügt`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-md mb-6">
      <div className="flex gap-2">
        <TabsList className="w-full">
          <TabsTrigger
            value="movie"
            onClick={() => setSearchType('movie')}
            className={searchType === 'movie' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Film className="w-4 h-4 mr-2" />
            Filme
          </TabsTrigger>
          <TabsTrigger
            value="tv"
            onClick={() => setSearchType('tv')}
            className={searchType === 'tv' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Tv className="w-4 h-4 mr-2" />
            Serien
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Nach ${searchType === 'movie' ? 'Filmen' : 'Serien'} suchen...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!selectedListId || isSearching}>
          {isSearching ? 'Suche...' : 'Suchen'}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
          {searchResults.map(media => (
            <MediaSearchResult
              key={media.id}
              media={media}
              onAdd={handleAddMedia}
              isAdded={existingMediaIds.includes(media.id)}
            />
          ))}
        </div>
      )}
    </form>
  );
};

export default MediaSearch;

interface MediaSearchResultProps {
  media: MovieOrShow;
  onAdd: (media: MovieOrShow) => void;
  isAdded: boolean;
}

const MediaSearchResult = ({ media, onAdd, isAdded }: MediaSearchResultProps) => (
  <div className="flex items-center gap-3 p-2 border rounded-md hover:bg-muted/30">
    <div className="h-12 w-8 bg-muted rounded overflow-hidden flex-shrink-0">
      {media.poster_path ? (
        <img 
          src={`https://image.tmdb.org/t/p/w92${media.poster_path}`}
          alt={media.title || media.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <Film className="h-full w-full p-1 text-muted-foreground" />
      )}
    </div>
    <div className="flex-grow">
      <p className="font-medium truncate">{media.title || media.name}</p>
      <p className="text-xs text-muted-foreground">
        {(media.release_date || media.first_air_date)?.substring(0, 4) || 'Unbekanntes Jahr'}
      </p>
    </div>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-green-500"
      onClick={() => onAdd(media)}
      disabled={isAdded}
    >
      {isAdded ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <Plus size={16} />
      )}
    </Button>
  </div>
);
