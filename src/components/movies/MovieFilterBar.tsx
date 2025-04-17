
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface MovieFilterBarProps {
  onFilterChange: (filter: string) => void;
  totalMovies: number;
  filteredMovies: number;
}

const MovieFilterBar = ({ onFilterChange, totalMovies, filteredMovies }: MovieFilterBarProps) => {
  const [searchInput, setSearchInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(searchInput);
  };
  
  const handleClear = () => {
    setSearchInput('');
    onFilterChange('');
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Filme suchen..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <Button type="submit">Suchen</Button>
      </form>
      
      <div className="mt-3 text-sm text-gray-500 flex items-center justify-between">
        <div>
          <span className="font-medium">{totalMovies}</span> Filme insgesamt
        </div>
        {totalMovies !== filteredMovies && (
          <div>
            <span className="font-medium">{filteredMovies}</span> Filme gefunden
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieFilterBar;
