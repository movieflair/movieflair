
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getGenres, Genre, getRecommendationByFilters, MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import SearchBox from '@/components/search/SearchBox';
import { trackPageVisit } from '@/lib/api';
import { 
  BadgeCheck, 
  Film, 
  Flame, 
  Filter, 
  FolderOpen, 
  Heart, 
  LoaderCircle,
  Star, 
  Tv
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const moodCategories = [
  { id: 'action', label: 'Action & Abenteuer', icon: <Flame className="w-4 h-4 mr-2" /> },
  { id: 'romance', label: 'Romantisch', icon: <Heart className="w-4 h-4 mr-2" /> },
  { id: 'topRated', label: 'Bestbewertet', icon: <Star className="w-4 h-4 mr-2" /> },
  { id: 'classic', label: 'Filmklassiker', icon: <BadgeCheck className="w-4 h-4 mr-2" /> },
];

const Genres = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state || {};
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(initialState.selectedGenre || null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [movies, setMovies] = useState<MovieOrShow[]>(initialState.preloadedMovies || []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  useEffect(() => {
    trackPageVisit('genres');
    
    const fetchGenres = async () => {
      try {
        const genresList = await getGenres();
        setGenres(genresList);
        
        // Wenn ein Genre aus dem Routing-State ausgewählt wurde und keine vorgeladenen Filme
        if (initialState.selectedGenre && !initialState.preloadedMovies) {
          handleGenreClick(initialState.selectedGenre);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, [initialState]);

  const handleGenreClick = async (genreId: number) => {
    setIsLoading(true);
    setSelectedGenre(genreId);
    setSelectedMood(null);
    
    try {
      const results = await getRecommendationByFilters({
        genres: [genreId],
        mediaType: activeTab as 'movie' | 'tv' | 'all'
      });
      
      setMovies(results);
    } catch (error) {
      console.error('Error fetching content by genre:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodClick = async (moodId: string) => {
    setIsLoading(true);
    setSelectedMood(moodId);
    setSelectedGenre(null);
    
    // Mapping moods to a filter configuration
    const moodFilters: Record<string, any> = {
      'action': { genres: [28, 12, 14], rating: 7 },
      'romance': { genres: [10749], rating: 6 },
      'topRated': { rating: 8 },
      'classic': { decades: ['1980', '1990'] }
    };
    
    const filterConfig = moodFilters[moodId] || {};
    
    try {
      const results = await getRecommendationByFilters({
        ...filterConfig,
        mediaType: activeTab as 'movie' | 'tv' | 'all'
      });
      
      setMovies(results);
    } catch (error) {
      console.error('Error fetching by mood:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedMood(null);
    setMovies([]);
  };

  const navigateToQuickTipp = () => {
    navigate('/quick-tipp');
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Entdecke neue Filme & Serien</h1>
              <p className="text-gray-600 max-w-2xl">
                Durchsuche unsere große Sammlung nach Genres, Stimmungen oder nutze unsere Suchfunktion, um genau das zu finden, was du sehen möchtest.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <SearchBox variant="page" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-gray-500" />
                    Filter
                  </h2>
                  {(selectedGenre !== null || selectedMood !== null) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-xs text-gray-500"
                    >
                      Zurücksetzen
                    </Button>
                  )}
                </div>
                
                <div className="mb-6">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'movies' | 'tv')}>
                    <TabsList className="w-full">
                      <TabsTrigger value="movies" className="w-full">
                        <Film className="w-4 h-4 mr-2" />
                        Filme
                      </TabsTrigger>
                      <TabsTrigger value="tv" className="w-full">
                        <Tv className="w-4 h-4 mr-2" />
                        Serien
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-[#ea384c]" />
                      Nach Stimmung
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {moodCategories.map((mood) => (
                        <Button
                          key={mood.id}
                          variant={selectedMood === mood.id ? "default" : "outline"}
                          size="sm"
                          className={`
                            ${selectedMood === mood.id ? 'bg-[#ea384c] hover:bg-[#ea384c]/90' : ''}
                          `}
                          onClick={() => handleMoodClick(mood.id)}
                        >
                          {mood.icon}
                          {mood.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                      <FolderOpen className="w-4 h-4 mr-2 text-[#ea384c]" />
                      Nach Genre
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <Button
                          key={genre.id}
                          variant={selectedGenre === genre.id ? "default" : "outline"}
                          size="sm"
                          className={`
                            ${selectedGenre === genre.id ? 'bg-[#ea384c] hover:bg-[#ea384c]/90' : ''}
                          `}
                          onClick={() => handleGenreClick(genre.id)}
                        >
                          {genre.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between" 
                      onClick={navigateToQuickTipp}
                    >
                      <span className="flex items-center">
                        <LoaderCircle className="w-4 h-4 mr-2" />
                        Überrasche mich
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="aspect-[2/3]">
                      <div className="animate-pulse h-full">
                        <div className="bg-muted rounded-lg h-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : movies.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg h-full flex flex-col items-center justify-center">
                  <div className="mb-4">
                    <Film className="w-12 h-12 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {selectedGenre !== null || selectedMood !== null 
                      ? "Keine Filme für diese Auswahl gefunden." 
                      : "Wähle ein Genre oder eine Stimmung, um Filme zu entdecken."}
                  </p>
                  {(selectedGenre !== null || selectedMood !== null) && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                    >
                      Filter zurücksetzen
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">
                      Ergebnisse 
                      <span className="text-sm text-gray-500 ml-2">({movies.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {movies.map((movie) => (
                      <div key={movie.id} className="aspect-[2/3]">
                        <MovieCard movie={movie} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Genres;
