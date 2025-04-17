
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useMemo } from 'react';

interface AdminSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
  activeTab: string;
}

const AdminSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  isLoading, 
  activeTab 
}: AdminSearchProps) => {
  // Memoize the placeholder text to prevent unnecessary re-renders
  const placeholderText = useMemo(() => {
    switch (activeTab) {
      case 'movies':
        return 'Suche Filme...';
      case 'shows':
        return 'Suche Serien...';
      case 'tags':
        return 'Suche Tags...';
      default:
        return 'Suche...';
    }
  }, [activeTab]);
      
  return (
    <form onSubmit={onSearch} className="flex max-w-md mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholderText}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <Button 
        type="submit" 
        className="ml-2"
        disabled={isLoading}
      >
        {isLoading ? 'Suche...' : 'Suchen'}
      </Button>
    </form>
  );
};

export default AdminSearch;
