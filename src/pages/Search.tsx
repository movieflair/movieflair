import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import SearchBox from '@/components/search/SearchBox';
import { searchMovies, searchTvShows, MovieOrShow, trackPageVisit } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv, Loader } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [tvShows, setTvShows] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (!query) return;
    
    trackPageVisit('search');
    
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const [moviesResults, tvResults] = await Promise.all([
          searchMovies(query),
          searchTvShows(query)
        ]);
        
        setMovies(moviesResults);
        setTvShows(tvResults);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [query]);
  
  const displayResults = activeTab === 'all' 
    ? [...movies, ...tvShows]
    : activeTab === 'movies' 
      ? movies 
      : tvShows;
  
  return (
    <EnhancedLayout>
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-6">Suche</h1>
          <SearchBox variant="page" initialQuery={query} />
        </div>
        
        {query && (
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">
              {isLoading 
                ? 'Suche läuft...' 
                : `Suchergebnisse für "${query}"`}
            </h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="all">
                  Alle
                  {!isLoading && <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {movies.length + tvShows.length}
                  </span>}
                </TabsTrigger>
                <TabsTrigger value="movies">
                  <Film className="w-4 h-4 mr-1" />
                  Filme
                  {!isLoading && <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {movies.length}
                  </span>}
                </TabsTrigger>
                <TabsTrigger value="shows">
                  <Tv className="w-4 h-4 mr-1" />
                  Serien
                  {!isLoading && <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {tvShows.length}
                  </span>}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                    <p className="mt-4 text-gray-500">Suchergebnisse werden geladen...</p>
                  </div>
                ) : displayResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Keine Ergebnisse gefunden.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayResults.map((item) => (
                      <div key={`${item.media_type}-${item.id}`} className="aspect-[2/3]">
                        <MovieCard movie={item} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {!query && (
          <div className="text-center py-12">
            <p className="text-gray-500">Gib einen Suchbegriff ein, um Filme und Serien zu finden.</p>
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
};

export default Search;
