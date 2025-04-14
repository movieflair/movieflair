
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterSelector from './FilterSelector';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { getGenres, Genre } from '@/lib/api';
import { Search } from 'lucide-react';

const moods = [
  'happy', 'sad', 'thrilling', 'thoughtful', 'relaxing',
  'inspiring', 'romantic', 'exciting', 'nostalgic', 'suspenseful', 'lighthearted'
];

const HomeFilterBox = () => {
  const navigate = useNavigate();
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedMoods.length) searchParams.set('moods', selectedMoods.join(','));
    if (selectedGenres.length) searchParams.set('genres', selectedGenres.join(','));
    navigate(`/discover?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-medium mb-4">Finde deinen nächsten Film</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Stimmung</label>
          <FilterSelector
            title="Wähle bis zu 3 Stimmungen"
            options={moods}
            onSelect={(mood) => {
              setSelectedMoods(prev => 
                prev.includes(mood.toString())
                  ? prev.filter(m => m !== mood.toString())
                  : prev.length < 3
                  ? [...prev, mood.toString()]
                  : prev
              );
            }}
            selectedValues={selectedMoods}
            type="mood"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <FilterSelector
            title="Wähle bis zu 3 Genres"
            options={genres || []}
            onSelect={(genreId) => {
              setSelectedGenres(prev => 
                prev.includes(Number(genreId))
                  ? prev.filter(id => id !== Number(genreId))
                  : prev.length < 3
                  ? [...prev, Number(genreId)]
                  : prev
              );
            }}
            selectedValues={selectedGenres}
            type="genre"
          />
        </div>

        <Button 
          onClick={handleSearch}
          className="w-full"
          size="lg"
        >
          <Search className="w-4 h-4 mr-2" />
          Film finden
        </Button>
      </div>
    </div>
  );
};

export default HomeFilterBox;
