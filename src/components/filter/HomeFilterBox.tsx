
import { useState } from 'react';
import FilterSelector from './FilterSelector';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { getGenres, getRecommendationByFilters, MovieOrShow } from '@/lib/api';
import { Search, Film, Tv, Star } from 'lucide-react';
import RecommendationCard from '../movies/RecommendationCard';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const moods = [
  'happy', 'sad', 'thrilling', 'thoughtful', 'relaxing',
  'inspiring', 'romantic', 'exciting', 'nostalgic', 'suspenseful', 'lighthearted'
];

const decades = ['1970', '1980', '1990', '2000', '2010', '2020'];

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
      setRecommendation(results[0]); // Zeige den ersten empfohlenen Film
    } catch (error) {
      console.error('Error getting recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-[800px] mx-auto">
      <h2 className="text-xl font-medium mb-4">Finde deinen nächsten Film oder Serie</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Medientyp</label>
          <RadioGroup 
            value={mediaType} 
            onValueChange={(value) => setMediaType(value as 'movie' | 'tv' | 'all')}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="movie" id="movie" />
              <Label htmlFor="movie" className="flex items-center gap-2 cursor-pointer">
                <Film className="h-4 w-4" />
                Filme
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tv" id="tv" />
              <Label htmlFor="tv" className="flex items-center gap-2 cursor-pointer">
                <Tv className="h-4 w-4" />
                Serien
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">
                Beides
              </Label>
            </div>
          </RadioGroup>
        </div>

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

        <div>
          <label className="block text-sm font-medium mb-2">Jahrzehnt</label>
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
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-amber-500" />
            <label className="block text-sm font-medium">Mindestbewertung: {rating}/10</label>
          </div>
          <Slider
            value={[rating]}
            min={0}
            max={10}
            step={1}
            onValueChange={(values) => setRating(values[0])}
          />
        </div>

        <Button 
          onClick={handleSearch}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Suche läuft...' : 'Film finden'}
        </Button>
      </div>

      {recommendation && (
        <div className="mt-8 animate-fade-in">
          <h3 className="text-lg font-medium mb-4">Deine Filmempfehlung</h3>
          <RecommendationCard movie={recommendation} />
        </div>
      )}
    </div>
  );
};

export default HomeFilterBox;
