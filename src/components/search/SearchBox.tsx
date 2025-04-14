
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

interface SearchBoxProps {
  variant?: 'navbar' | 'page';
  initialQuery?: string;
}

const SearchBox = ({ variant = 'navbar', initialQuery = '' }: SearchBoxProps) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  
  if (variant === 'navbar') {
    return (
      <form onSubmit={handleSubmit} className="relative hidden md:block">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filme & Serien suchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-md border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 transition-colors"
          />
        </div>
      </form>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Filme & Serien suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 py-3 w-full bg-white rounded-lg border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-lg"
          autoFocus
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition-colors"
        >
          Suchen
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
