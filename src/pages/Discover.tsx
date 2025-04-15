import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Command, CommandInput, CommandList, CommandEmpty } from '@/components/ui/command';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Film, Compass, Sparkles } from 'lucide-react';
import FilterSelector from '@/components/filter/FilterSelector';
import RecommendationCard from '@/components/movies/RecommendationCard';
import { 
  Genre, 
  getGenres, 
  moodToGenres, 
  FilterOptions, 
  getRecommendationByFilters,
  getMovieById,
  getTvShowById,
  MovieDetail,
  MovieOrShow
} from '@/lib/api';

const moods = [
  'happy', 'sad', 'thrilling', 'thoughtful', 'relaxing',
  'inspiring', 'romantic', 'exciting', 'nostalgic', 'suspenseful', 'lighthearted'
];

const decades = [
  '1970', '1980', '1990', '2000', '2010', '2020'
];

const Discover = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Fetch genres when component mounts
    const fetchGenres = async () => {
      try {
        const genresList = await getGenres();
        setGenres(genresList);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const handleMoodSelection = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood) 
        : [...prev, mood]
    );
  };

  const handleGenreSelection = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(g => g !== genreId) 
        : [...prev, genreId]
    );
  };

  const handleDecadeSelection = (decade: string) => {
    setSelectedDecades(prev => 
      prev.includes(decade) 
        ? prev.filter(d => d !== decade) 
        : [...prev, decade]
    );
  };

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Combine all genres from selected moods
      const genresFromMoods = selectedMoods.flatMap(mood => moodToGenres[mood] || []);
      
      // Combine with directly selected genres and remove duplicates
      const allGenres = [...new Set([...genresFromMoods, ...selectedGenres])];
      
      // Use the first selected decade if any
      const decade = selectedDecades.length > 0 ? selectedDecades[0] : undefined;
      
      const filters: FilterOptions = {
        genres: allGenres.length > 0 ? allGenres : undefined,
        decades: selectedDecades.length > 0 ? selectedDecades : undefined,
        moods: selectedMoods.length > 0 ? selectedMoods : undefined
      };
      
      // Get a recommendation based on filters
      const results = await getRecommendationByFilters(filters);
      
      if (results.length > 0) {
        const result = results[0]; // Get the first result
        
        // Get full details for the recommendation
        const detailedResult = 
          result.media_type === 'movie' 
            ? await getMovieById(result.id) 
            : await getTvShowById(result.id);
        
        setRecommendation(detailedResult);
      } else {
        setRecommendation(null);
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    handleGetRecommendation();
  };

  const handleViewDetails = () => {
    if (recommendation) {
      navigate(`/${recommendation.media_type}/${recommendation.id}`);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center mb-4">
              <Compass className="w-8 h-8 text-purple-500 mr-2" />
              <h1 className="text-3xl font-semibold">Entdecke Neues</h1>
            </div>
            <p className="text-lg text-gray-600">
              Finde den perfekten Film oder die Serie für jeden Moment
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <Command className="border-none">
              <CommandInput 
                placeholder="Suche nach Filmen, Serien oder Kategorien..." 
                value={searchQuery}
                onValueChange={handleSearch}
              />
            </Command>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full justify-start bg-transparent border-b space-x-8">
              <TabsTrigger 
                value="explore" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none border-b-2 border-transparent"
              >
                <Compass className="w-4 h-4 mr-2" />
                Entdecken
              </TabsTrigger>
              <TabsTrigger 
                value="movies" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none border-b-2 border-transparent"
              >
                <Film className="w-4 h-4 mr-2" />
                Filme
              </TabsTrigger>
              <TabsTrigger 
                value="mood" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none border-b-2 border-transparent"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Nach Stimmung
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                <FilterSelector 
                  title="Select mood" 
                  options={moods}
                  onSelect={(mood) => handleMoodSelection(mood as string)}
                  selectedValues={selectedMoods}
                  type="mood"
                  maxSelections={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Choose genres (optional)</label>
                <FilterSelector 
                  title="Select genres" 
                  options={genres}
                  onSelect={(genreId) => handleGenreSelection(genreId as number)}
                  selectedValues={selectedGenres}
                  type="genre"
                  maxSelections={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Select decade (optional)</label>
                <FilterSelector 
                  title="Select decade" 
                  options={decades}
                  onSelect={(decade) => handleDecadeSelection(decade as string)}
                  selectedValues={selectedDecades}
                  type="decade"
                  maxSelections={1}
                />
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={handleGetRecommendation}
                  disabled={isLoading || (selectedMoods.length === 0 && selectedGenres.length === 0)}
                  className="button-primary w-full py-3"
                >
                  {isLoading ? 'Finding the perfect match...' : 'Get Recommendation'}
                </button>
              </div>

              {hasSearched && (
                <div className="animate-fade">
                  {recommendation ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">Your Recommendation</h2>
                        <button 
                          onClick={handleTryAgain}
                          className="button-secondary flex items-center"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Try Another
                        </button>
                      </div>
                      
                      <RecommendationCard movie={recommendation} />
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                      <h2 className="text-xl font-medium mb-2">No Recommendations Found</h2>
                      <p className="text-muted-foreground mb-6">
                        Try different filters or moods to get a recommendation.
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedMoods([]);
                          setSelectedGenres([]);
                          setSelectedDecades([]);
                          setHasSearched(false);
                        }}
                        className="button-secondary"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="movies" className="space-y-8">
              {/* Movies content will be implemented based on your needs */}
            </TabsContent>

            <TabsContent value="mood" className="space-y-8">
              {/* Mood-based content will be implemented based on your needs */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Discover;
