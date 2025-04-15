import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import FilterSelector from './FilterSelector';
import MediaTypeSelector from './filters/MediaTypeSelector';
import RatingSelector from './filters/RatingSelector';
import FilterRecommendation from './recommendation/FilterRecommendation';
import { MovieOrShow, getRecommendationByFilters } from '@/lib/api';
import { toast } from 'sonner';
import { Genre } from '@/lib/types';

const genres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Abenteuer' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Komödie' },
  { id: 80, name: 'Krimi' },
  { id: 99, name: 'Dokumentarfilm' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familie' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'Historie' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Musik' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romanze' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV-Film' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Kriegsfilm' },
  { id: 37, name: 'Western' }
];

const moods = [
  'fröhlich', 'nachdenklich', 'entspannend', 'romantisch', 'spannend',
  'nostalgisch', 'inspirierend', 'dramatisch', 'aufregend', 'geheimnisvoll',
  'herzerwärmend'
];

const decades = ['2020', '2010', '2000', '1990', '1980', '1970'];

const HomeFilterBox = () => {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'all'>('movie');
  const [rating, setRating] = useState<number>(5);
  const [recommendation, setRecommendation] = useState<MovieOrShow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUsedFilter, setLastUsedFilter] = useState<{
    moods: string[];
    genres: number[];
    decades: string[];
    mediaType: 'movie' | 'tv' | 'all';
    rating: number;
  } | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    const currentFilter = {
      moods: selectedMoods,
      genres: selectedGenres,
      decades: selectedDecades,
      mediaType,
      rating
    };
    
    setLastUsedFilter(currentFilter);
    
    try {
      const results = await getRecommendationByFilters(currentFilter);
      
      if (results.length === 0) {
        toast.error('Keine passenden Filme gefunden. Bitte versuche andere Filter.');
        setRecommendation(null);
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        setRecommendation(results[randomIndex]);
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      toast.error('Fehler bei der Suche. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefreshRecommendation = async () => {
    if (!lastUsedFilter) return;
    setIsLoading(true);
    
    try {
      const results = await getRecommendationByFilters(lastUsedFilter);
      
      if (results.length === 0) {
        toast.error('Keine weiteren passenden Filme gefunden.');
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        const newRecommendation = results[randomIndex];
        
        if (recommendation && newRecommendation.id === recommendation.id && results.length > 1) {
          const newIndex = (randomIndex + 1) % results.length;
          setRecommendation(results[newIndex]);
        } else {
          setRecommendation(newRecommendation);
        }
        
        toast.success('Neuer Filmvorschlag generiert!');
      }
    } catch (error) {
      console.error('Error refreshing recommendation:', error);
      toast.error('Fehler beim Aktualisieren des Vorschlags.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 max-w-[800px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-theme-black" />
        <h2 className="text-2xl font-medium text-theme-black">Finde deinen perfekten Film</h2>
      </div>
      
      <div className="space-y-6">
        <MediaTypeSelector 
          value={mediaType} 
          onChange={(value) => setMediaType(value)} 
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-theme-black">Welche Stimmung suchst du?</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {moods.map((mood) => (
              <Button
                key={mood}
                variant="default"
                className={`
                  ${selectedMoods.includes(mood) 
                    ? 'bg-[#ff3131] hover:bg-[#ff3131]/90 text-white' 
                    : 'hover:bg-gray-100 text-theme-black border border-gray-200 bg-white'}
                  transition-all font-medium text-sm
                `}
                onClick={() => {
                  setSelectedMoods(prev =>
                    prev.includes(mood)
                      ? prev.filter(m => m !== mood)
                      : prev.length < 3
                      ? [...prev, mood]
                      : prev
                  );
                }}
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-3">Genre</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-3">Jahrzehnt</label>
          <FilterSelector
            title="Wähle ein Jahrzehnt"
            options={decades}
            onSelect={(decade) => {
              setSelectedDecades(prev => 
                prev.includes(decade.toString())
                  ? prev.filter(d => d !== decade.toString())
                  : [decade.toString()]
              );
            }}
            selectedValues={selectedDecades}
            type="decade"
          />
        </div>
        
        <RatingSelector value={rating} onChange={setRating} />

        <Button 
          onClick={handleSearch}
          className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 text-white transition-colors"
          size="lg"
          disabled={isLoading}
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Suche läuft...' : 'Film finden'}
        </Button>
      </div>

      {recommendation && (
        <FilterRecommendation 
          recommendation={recommendation}
          onRefresh={handleRefreshRecommendation}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default HomeFilterBox;
