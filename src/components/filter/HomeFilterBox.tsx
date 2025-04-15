import { useState } from 'react';
import FilterSelector from './FilterSelector';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { getGenres, getRecommendationByFilters, MovieOrShow } from '@/lib/api';
import { Search, Film, Tv, Star, Sparkles, Film2 } from 'lucide-react';
import RecommendationCard from '../movies/RecommendationCard';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const moods = [
  'fröhlich',
  'nachdenklich',
  'entspannend',
  'romantisch',
  'spannend',
  'nostalgisch',
  'inspirierend',
  'dramatisch',
  'aufregend',
  'geheimnisvoll',
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

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await getRecommendationByFilters({
        moods: selectedMoods,
        genres: selectedGenres,
        decades: selectedDecades,
        mediaType,
        rating
      });
      setRecommendation(results[0]);
    } catch (error) {
      console.error('Error getting recommendation:', error);
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
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">Was möchtest du sehen?</label>
          <RadioGroup 
            value={mediaType} 
            onValueChange={(value) => setMediaType(value as 'movie' | 'tv' | 'all')}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="movie" id="movie" className="border-[#ea384c] text-[#ea384c]" />
              <Label htmlFor="movie" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                <Film className="h-4 w-4" />
                Filme
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tv" id="tv" className="border-[#ea384c] text-[#ea384c]" />
              <Label htmlFor="tv" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                <Tv className="h-4 w-4" />
                Serien
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" className="border-[#ea384c] text-[#ea384c]" />
              <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                <Film2 className="h-4 w-4" />
                Beides
              </Label>
            </div>
          </RadioGroup>
        </div>

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
                    : "hover:bg-gray-700/50 text-gray-200 border border-gray-600"
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
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-500" />
            <label className="block text-sm font-medium text-gray-200">Mindestbewertung: {rating}/10</label>
          </div>
          <Slider
            value={[rating]}
            min={0}
            max={10}
            step={1}
            onValueChange={(values) => setRating(values[0])}
            className="py-4 [&_.text-primary]:text-[#ea384c] [&_[role=slider]]:bg-[#ea384c]"
          />
        </div>

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
        <div className="mt-8 animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">Deine Filmempfehlung</h3>
          <div className="max-w-[300px] mx-auto">
            <RecommendationCard movie={recommendation} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeFilterBox;
