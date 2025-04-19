
import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import FilterSelector from './FilterSelector';
import RatingSelector from './filters/RatingSelector';
import FilterRecommendation from './recommendation/FilterRecommendation';
import MoodSelector from './filters/MoodSelector';
import { useFilterSearch } from '@/hooks/useFilterSearch';
import { genres, moods, decades } from './data/filterOptions';

const HomeFilterBox = () => {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);
  const mediaType = 'movie' as const;
  const [rating, setRating] = useState<number>(5);
  
  const { isLoading, recommendation, handleSearch, handleRefreshRecommendation } = useFilterSearch();

  const handleMoodSelect = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : prev.length < 3
        ? [...prev, mood]
        : prev
    );
  };

  const initiateSearch = () => {
    handleSearch({
      moods: selectedMoods,
      genres: selectedGenres,
      decades: selectedDecades,
      mediaType,
      rating
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 max-w-[800px] mx-auto">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-theme-black" />
        <h2 className="text-xl md:text-2xl font-medium text-theme-black">Finde deinen perfekten Film</h2>
      </div>
      
      <div className="space-y-4 md:space-y-6">
        <MoodSelector 
          moods={moods}
          selectedMoods={selectedMoods}
          onMoodSelect={handleMoodSelect}
        />

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-3">Genre</label>
          <FilterSelector
            title="Wähle bis zu 3 Genres"
            options={genres}
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
          onClick={initiateSearch}
          className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 text-white transition-colors text-sm md:text-base py-2 md:py-2.5"
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
