
import React, { useState } from 'react';
import { Search, Sparkles, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';
import FilterSelector from './FilterSelector';
import MediaTypeSelector from './filters/MediaTypeSelector';
import RatingSelector from './filters/RatingSelector';
import FilterRecommendation from './recommendation/FilterRecommendation';
import { MovieOrShow, getRecommendationByFilters } from '@/lib/api';
import { toast } from 'sonner';

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
    <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-lg p-8 rounded-xl shadow-xl max-w-[800px] mx-auto border border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-[#ea384c]" />
        <h2 className="text-2xl font-medium text-white">Finde deinen perfekten Film</h2>
      </div>
      
      <div className="space-y-6">
        <MediaTypeSelector 
          value={mediaType} 
          onChange={(value) => setMediaType(value)} 
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-200">Welche Stimmung suchst du?</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {moods.map((mood) => (
              <Button
                key={mood}
                variant={selectedMoods.includes(mood) ? "default" : "outline"}
                className={`${
                  selectedMoods.includes(mood)
                    ? "bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
                    : "hover:bg-gray-700/50 text-gray-800 border border-gray-600 bg-gray-200"
                } transition-all font-medium`}
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
          <label className="block text-sm font-medium text-gray-200 mb-3">Genre</label>
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
          <label className="block text-sm font-medium text-gray-200 mb-3">Jahrzehnt</label>
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
          className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
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
