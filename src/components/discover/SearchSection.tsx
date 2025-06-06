
import { Command, CommandInput } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SearchSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/suche?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl font-semibold mb-6">Entdecke neue Filme</h1>
      <Command className="rounded-lg border shadow-md max-w-2xl mx-auto">
        <CommandInput 
          placeholder="Suche nach Filmen oder Genres..." 
          value={searchQuery}
          onValueChange={handleSearch}
          className="h-12"
        />
      </Command>
    </div>
  );
};

export default SearchSection;
