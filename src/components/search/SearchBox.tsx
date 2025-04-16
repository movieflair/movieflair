import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { genres } from '@/components/filter/data/filterOptions';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/lib/api';

interface SearchBoxProps {
  variant?: 'navbar' | 'page';
  initialQuery?: string;
}

const SearchBox = ({ variant = 'navbar', initialQuery = '' }: SearchBoxProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['quickSearch', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      return searchMovies(query);
    },
    enabled: query.length >= 2,
  });
  
  const filteredGenres = query.length >= 2 
    ? genres.filter(genre => 
        genre.name.toLowerCase().includes(query.toLowerCase()))
    : [];
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/suche?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const handleGenreSelect = (genreId: number, genreName: string) => {
    navigate('/genres', { 
      state: { selectedGenre: genreId, genreName }
    });
    setOpen(false);
  };
  
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  if (variant === 'navbar') {
    return (
      <form onSubmit={handleSubmit} className="relative hidden md:block">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filme & Genres suchen..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-md border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 transition-colors"
          />
        </div>
      </form>
    );
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filme & Genres suchen..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-12 pr-4 py-3 w-full bg-white rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors text-lg"
            autoFocus
            onClick={(e) => {
              e.stopPropagation();
              if (query.length >= 2) setOpen(true);
            }}
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition-colors"
          >
            Suchen
          </button>
        </div>
      </form>
      
      {open && query.length >= 2 && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="rounded-lg border-none">
            <CommandList>
              {isLoading && (
                <div className="p-2 text-center text-sm text-gray-500">
                  Suche läuft...
                </div>
              )}
              
              {!isLoading && filteredGenres.length === 0 && (!searchResults || searchResults.length === 0) && (
                <CommandEmpty>Keine Ergebnisse gefunden</CommandEmpty>
              )}
              
              {filteredGenres.length > 0 && (
                <CommandGroup heading="Genres">
                  {filteredGenres.slice(0, 5).map(genre => (
                    <CommandItem 
                      key={genre.id}
                      onSelect={() => handleGenreSelect(genre.id, genre.name)}
                      className="cursor-default"
                    >
                      <span className="text-sm text-gray-800">{genre.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {searchResults && searchResults.length > 0 && (
                <CommandGroup heading="Filme & Serien">
                  {searchResults.map(result => (
                    <CommandItem 
                      key={result.id}
                      onSelect={() => {
                        navigate(`/${result.media_type === 'movie' ? 'film' : 'serie'}/${result.id}`);
                        setOpen(false);
                      }}
                      className="cursor-default"
                    >
                      <div className="flex items-center">
                        {result.poster_path && (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                            alt={result.title || result.name || ''} 
                            className="w-8 h-12 object-cover mr-2 rounded"
                          />
                        )}
                        <span className="text-sm text-gray-800">{result.title || result.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem 
                    onSelect={() => handleSubmit()} 
                    className="cursor-default text-gray-700"
                  >
                    Alle Ergebnisse anzeigen...
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
