import { useState, useEffect } from 'react';
import { Search, FileEdit, Film, Pencil, Tv } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getPopularMovies, 
  getFreeMovies, 
  getTrailerMovies,
  searchMovies, 
  searchTvShows,
  getPopularTvShows,
  MovieOrShow 
} from '@/lib/api';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminStats from './AdminStats';
import AdminVisitorStats from './AdminVisitorStats';
import AdminContentTabs from './AdminContentTabs';
import MovieEditForm from './MovieEditForm';
import TvShowEditForm from './TvShowEditForm';
import CustomListManager from './CustomListManager';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    amazonAffiliateId, 
    setAmazonAffiliateId, 
    saveSettings 
  } = useAdminSettings();
  const [streamUrl, setStreamUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [hasStream, setHasStream] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieOrShow | null>(null);
  const [selectedTvShow, setSelectedTvShow] = useState<MovieOrShow | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<MovieOrShow[]>([]);
  const [filteredTvShows, setFilteredTvShows] = useState<MovieOrShow[]>([]);
  const [streamType, setStreamType] = useState<'embed' | 'link'>('embed');
  const [hasTrailer, setHasTrailer] = useState(false);
  const [isFreeMovie, setIsFreeMovie] = useState(false);
  const [isNewTrailer, setIsNewTrailer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<'all' | 'free' | 'trailers'>('all');
  
  const queryClient = useQueryClient();

  const { data: movies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: getPopularMovies
  });
  
  const { data: freeMovies = [], isLoading: isLoadingFreeMovies } = useQuery({
    queryKey: ['admin-free-movies'],
    queryFn: getFreeMovies
  });
  
  const { data: trailerMovies = [], isLoading: isLoadingTrailerMovies } = useQuery({
    queryKey: ['admin-trailer-movies'],
    queryFn: getTrailerMovies
  });
  
  const { data: tvShows = [], isLoading: isLoadingTvShows } = useQuery({
    queryKey: ['admin-tv-shows'],
    queryFn: getPopularTvShows
  });
  
  const { data: searchResults = [], isLoading: isSearchLoading, refetch: refetchSearch } = useQuery({
    queryKey: ['search-movies', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: false,
  });
  
  const { data: searchTvResults = [], isLoading: isSearchTvLoading, refetch: refetchTvSearch } = useQuery({
    queryKey: ['search-tv-shows', searchQuery],
    queryFn: () => searchTvShows(searchQuery),
    enabled: false,
  });

  useEffect(() => {
    if (activeTab === 'movies' && !isSearching) {
      if (currentView === 'free') {
        setFilteredMovies(freeMovies);
      } else if (currentView === 'trailers') {
        setFilteredMovies(trailerMovies);
      } else {
        if (!searchQuery.trim()) {
          setFilteredMovies(movies);
        } else {
          const query = searchQuery.toLowerCase().trim();
          const filtered = movies.filter(movie => 
            (movie.title?.toLowerCase() || '').includes(query)
          );
          setFilteredMovies(filtered);
        }
      }
    } else if (activeTab === 'movies' && isSearching) {
      setFilteredMovies(searchResults);
    } else if (activeTab === 'shows' && !isSearching) {
      if (!searchQuery.trim()) {
        setFilteredTvShows(tvShows);
      } else {
        const query = searchQuery.toLowerCase().trim();
        const filtered = tvShows.filter(show => 
          (show.name?.toLowerCase() || '').includes(query)
        );
        setFilteredTvShows(filtered);
      }
    } else if (activeTab === 'shows' && isSearching) {
      setFilteredTvShows(searchTvResults);
    }
  }, [
    searchQuery, 
    movies, 
    tvShows, 
    activeTab, 
    isSearching, 
    searchResults, 
    searchTvResults, 
    currentView, 
    freeMovies, 
    trailerMovies
  ]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setIsSearching(true);
      if (activeTab === 'movies') {
        await refetchSearch();
      } else if (activeTab === 'shows') {
        await refetchTvSearch();
      }
    } else {
      setIsSearching(false);
      if (activeTab === 'movies') {
        setFilteredMovies(currentView === 'free' ? freeMovies : 
                         currentView === 'trailers' ? trailerMovies : movies);
      } else if (activeTab === 'shows') {
        setFilteredTvShows(tvShows);
      }
    }
  };

  const handleEditMovie = (movie: MovieOrShow) => {
    setSelectedMovie(movie);
    setSelectedTvShow(null);
    setHasStream(movie.hasStream || false);
    setStreamUrl(movie.streamUrl || '');
    setStreamType(movie.streamUrl?.includes('embed') ? 'embed' : 'link');
    setHasTrailer(movie.hasTrailer || false);
    setTrailerUrl(movie.trailerUrl || '');
    setIsFreeMovie(movie.isFreeMovie || false);
    setIsNewTrailer(movie.isNewTrailer || false);
  };
  
  const handleEditTvShow = (show: MovieOrShow) => {
    setSelectedTvShow(show);
    setSelectedMovie(null);
    setHasStream(show.hasStream || false);
    setStreamUrl(show.streamUrl || '');
    setStreamType(show.streamUrl?.includes('embed') ? 'embed' : 'link');
    setHasTrailer(show.hasTrailer || false);
    setTrailerUrl(show.trailerUrl || '');
  };

  const handleSaveMovie = () => {
    if (!selectedMovie) return;

    const savedMoviesJson = localStorage.getItem('adminMovies');
    let savedMovies: MovieOrShow[] = [];
    
    if (savedMoviesJson) {
      try {
        savedMovies = JSON.parse(savedMoviesJson);
      } catch (e) {
        console.error('Error parsing saved movies:', e);
      }
    }
    
    const existingIndex = savedMovies.findIndex(m => m.id === selectedMovie.id);
    
    const updatedMovie = {
      ...selectedMovie,
      hasStream: isFreeMovie, // Set hasStream based on isFreeMovie
      streamUrl: isFreeMovie ? streamUrl : '',
      hasTrailer: isNewTrailer, // Set hasTrailer based on isNewTrailer
      trailerUrl: isNewTrailer ? trailerUrl : '',
      isFreeMovie,
      isNewTrailer
    };
    
    if (existingIndex >= 0) {
      savedMovies[existingIndex] = updatedMovie;
    } else {
      savedMovies.push(updatedMovie);
    }
    
    localStorage.setItem('adminMovies', JSON.stringify(savedMovies));
    
    // Invalidate all relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
    queryClient.invalidateQueries({ queryKey: ['admin-free-movies'] });
    queryClient.invalidateQueries({ queryKey: ['admin-trailer-movies'] });
    queryClient.invalidateQueries({ queryKey: ['search-movies'] });
    
    toast.success("Änderungen gespeichert");
    
    setSelectedMovie(null);
  };
  
  const handleSaveTvShow = () => {
    if (!selectedTvShow) return;

    const savedShowsJson = localStorage.getItem('adminShows');
    let savedShows: MovieOrShow[] = [];
    
    if (savedShowsJson) {
      try {
        savedShows = JSON.parse(savedShowsJson);
      } catch (e) {
        console.error('Error parsing saved shows:', e);
      }
    }
    
    const existingIndex = savedShows.findIndex(s => s.id === selectedTvShow.id);
    
    const updatedShow = {
      ...selectedTvShow,
      hasStream,
      streamUrl: hasStream ? streamUrl : '',
      hasTrailer,
      trailerUrl: hasTrailer ? trailerUrl : ''
    };
    
    if (existingIndex >= 0) {
      savedShows[existingIndex] = updatedShow;
    } else {
      savedShows.push(updatedShow);
    }
    
    localStorage.setItem('adminShows', JSON.stringify(savedShows));
    
    queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
    queryClient.invalidateQueries({ queryKey: ['search-tv-shows'] });
    
    toast.success("Änderungen gespeichert");
    
    setSelectedTvShow(null);
  };

  const handleViewChange = (view: 'all' | 'free' | 'trailers') => {
    setCurrentView(view);
    setIsSearching(false);
    
    if (view === 'free') {
      setFilteredMovies(freeMovies);
    } else if (view === 'trailers') {
      setFilteredMovies(trailerMovies);
    } else {
      setFilteredMovies(movies);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="button-secondary"
        >
          Logout
        </button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="content">Inhalte</TabsTrigger>
          <TabsTrigger value="custom-lists">Benutzerdefinierte Listen</TabsTrigger>
          <TabsTrigger value="stats">Feedback-Statistik</TabsTrigger>
          <TabsTrigger value="visitors">Besucherstatistik</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <AdminContentTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentView={currentView}
              handleViewChange={handleViewChange}
            />

            <div className="p-4">
              <form onSubmit={handleSearch} className="flex max-w-md mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Suche ${activeTab === 'movies' ? 'Filme' : activeTab === 'shows' ? 'Serien' : 'Tags'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button 
                  type="submit" 
                  className="button-primary ml-2"
                  disabled={isSearchLoading || isSearchTvLoading}
                >
                  {(isSearchLoading || isSearchTvLoading) ? 'Suche...' : 'Suchen'}
                </button>
              </form>

              {activeTab === 'movies' && selectedMovie && (
                <MovieEditForm
                  selectedMovie={selectedMovie}
                  isNewTrailer={isNewTrailer}
                  isFreeMovie={isFreeMovie}
                  streamUrl={streamUrl}
                  streamType={streamType}
                  trailerUrl={trailerUrl}
                  onTrailerChange={(checked) => {
                    setIsNewTrailer(checked);
                    setHasTrailer(checked);
                  }}
                  onFreeMovieChange={(checked) => {
                    setIsFreeMovie(checked);
                    setHasStream(checked);
                  }}
                  setStreamType={setStreamType}
                  setStreamUrl={setStreamUrl}
                  setTrailerUrl={setTrailerUrl}
                  onSave={handleSaveMovie}
                  onCancel={() => setSelectedMovie(null)}
                />
              )}

              {activeTab === 'shows' && selectedTvShow && (
                <TvShowEditForm
                  selectedTvShow={selectedTvShow}
                  hasStream={hasStream}
                  hasTrailer={hasTrailer}
                  streamUrl={streamUrl}
                  streamType={streamType}
                  trailerUrl={trailerUrl}
                  setHasStream={setHasStream}
                  setHasTrailer={setHasTrailer}
                  setStreamType={setStreamType}
                  setStreamUrl={setStreamUrl}
                  setTrailerUrl={setTrailerUrl}
                  onSave={handleSaveTvShow}
                  onCancel={() => setSelectedTvShow(null)}
                />
              )}

              {activeTab === 'movies' && !selectedMovie && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    {isSearching 
                      ? `Suchergebnisse für "${searchQuery}"`
                      : currentView === 'free' 
                        ? 'Kostenlose Filme'
                        : currentView === 'trailers'
                          ? 'Neue Trailer'
                          : 'Beliebte Filme'
                    }
                  </h3>
                  
                  {isSearchLoading || isLoadingMovies || isLoadingFreeMovies || isLoadingTrailerMovies ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Lade Filme...</p>
                    </div>
                  ) : filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMovies.map(movie => (
                        <div 
                          key={movie.id} 
                          className="border border-border rounded-md p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => handleEditMovie(movie)}
                        >
                          <div className="flex items-start">
                            <div className="w-16 h-24 bg-muted rounded overflow-hidden">
                              {movie.poster_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                  alt={movie.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Film className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-grow">
                              <h4 className="font-medium">{movie.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {movie.release_date?.substring(0, 4) || 'Unbekanntes Jahr'}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {movie.hasStream && (
                                  <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Stream verfügbar
                                  </span>
                                )}
                                {movie.hasTrailer && (
                                  <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Trailer
                                  </span>
                                )}
                                {movie.isFreeMovie && (
                                  <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                    Kostenlos
                                  </span>
                                )}
                                {movie.isNewTrailer && (
                                  <span className="inline-block text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    Neu
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'Keine Filme gefunden.' : 
                       currentView === 'free' ? 'Keine kostenlosen Filme markiert.' :
                       currentView === 'trailers' ? 'Keine neuen Trailer markiert.' :
                       'Keine Filme verfügbar.'}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'shows' && !selectedTvShow && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    {isSearching 
                      ? `Suchergebnisse für "${searchQuery}"`
                      : 'Beliebte Serien'
                    }
                  </h3>
                  
                  {isSearchTvLoading || isLoadingTvShows ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Lade Serien...</p>
                    </div>
                  ) : filteredTvShows.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTvShows.map(show => (
                        <div 
                          key={show.id} 
                          className="border border-border rounded-md p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => handleEditTvShow(show)}
                        >
                          <div className="flex items-start">
                            <div className="w-16 h-24 bg-muted rounded overflow-hidden">
                              {show.poster_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w200${show.poster_path}`} 
                                  alt={show.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Tv className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-grow">
                              <h4 className="font-medium">{show.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {show.first_air_date?.substring(0, 4) || 'Unbekanntes Jahr'}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {show.hasStream && (
                                  <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Stream verfügbar
                                  </span>
                                )}
                                {show.hasTrailer && (
                                  <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Trailer
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'Keine Serien gefunden.' : 'Keine Serien verfügbar.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="custom-lists">
          <CustomListManager />
        </TabsContent>
        
        <TabsContent value="stats">
          <AdminStats />
        </TabsContent>
        
        <TabsContent value="visitors">
          <AdminVisitorStats />
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileEdit className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Einstellungen</h2>
            </div>
            
            <div className="border border-border rounded-md p-6">
              <h3 className="text-lg font-medium mb-4">Amazon Affiliate</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amazonAffiliateId">Amazon Affiliate ID</Label>
                  <Input 
                    id="amazonAffiliateId" 
                    placeholder="dein-20" 
                    className="max-w-md mt-1"
                    value={amazonAffiliateId}
                    onChange={(e) => setAmazonAffiliateId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Deine Amazon Affiliate ID, die für Amazon-Links verwendet wird.
                  </p>
                </div>

                <Button onClick={saveSettings}>Einstellungen speichern</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
