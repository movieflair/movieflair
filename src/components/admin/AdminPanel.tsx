
import { useState, useEffect } from 'react';
import { Search, FileEdit, Film, Tv, Tag, Video, PlayCircle, ShoppingCart, ExternalLink, Link as LinkIcon, BarChart, Pencil } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  // Movie queries
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
          <TabsTrigger value="stats">Feedback-Statistik</TabsTrigger>
          <TabsTrigger value="visitors">Besucherstatistik</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'movies'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('movies');
                  setCurrentView('all');
                  setIsSearching(false);
                }}
              >
                <Film className="w-4 h-4 mr-2" />
                Filme
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'shows'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('shows');
                  setIsSearching(false);
                }}
              >
                <Tv className="w-4 h-4 mr-2" />
                Serien
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'movies' && currentView === 'free'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('movies');
                  handleViewChange('free');
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                Kostenlose Filme
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'movies' && currentView === 'trailers'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('movies');
                  handleViewChange('trailers');
                }}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Neue Trailer
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'tags'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('tags')}
              >
                <Tag className="w-4 h-4 mr-2" />
                Tags
              </button>
            </div>

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

              {/* Film-Verwaltung */}
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

              {/* Serien-Verwaltung */}
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

              {/* Film-Bearbeitung */}
              {activeTab === 'movies' && selectedMovie && (
                <div className="border border-border rounded-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Film bearbeiten</h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedMovie(null)}
                      className="text-sm"
                    >
                      Zurück zur Liste
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title">Titel</Label>
                      <Input 
                        id="title" 
                        placeholder="Fight Club" 
                        className="mt-1" 
                        value={selectedMovie.title || ''}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Jahr</Label>
                      <Input 
                        id="year" 
                        placeholder="1999" 
                        className="mt-1" 
                        value={selectedMovie.release_date?.substring(0, 4) || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <textarea 
                        id="description"
                        rows={3}
                        className="w-full mt-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Film Beschreibung..."
                        value={selectedMovie.overview || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="flex flex-col md:col-span-2">
                      <div className="text-lg font-medium mb-2">Einstellungen</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasStream" 
                            checked={hasStream}
                            onCheckedChange={(checked) => setHasStream(checked as boolean)}
                          />
                          <Label htmlFor="hasStream" className="flex items-center gap-1">
                            <PlayCircle className="w-4 h-4" /> 
                            Stream verfügbar
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasTrailer" 
                            checked={hasTrailer}
                            onCheckedChange={(checked) => setHasTrailer(checked as boolean)}
                          />
                          <Label htmlFor="hasTrailer" className="flex items-center gap-1">
                            <Video className="w-4 h-4" /> 
                            Als Trailer anzeigen
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="isFreeMovie" 
                            checked={isFreeMovie}
                            onCheckedChange={(checked) => setIsFreeMovie(checked as boolean)}
                          />
                          <Label htmlFor="isFreeMovie" className="flex items-center gap-1">
                            <ShoppingCart className="w-4 h-4" /> 
                            Als kostenlos markieren
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="isNewTrailer" 
                            checked={isNewTrailer}
                            onCheckedChange={(checked) => setIsNewTrailer(checked as boolean)}
                          />
                          <Label htmlFor="isNewTrailer" className="flex items-center gap-1">
                            <Tag className="w-4 h-4" /> 
                            Als neuen Trailer markieren
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    {hasStream && (
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <Label className="mb-2 block">Stream URL Typ</Label>
                          <RadioGroup 
                            value={streamType} 
                            onValueChange={(value) => setStreamType(value as 'embed' | 'link')}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="embed" id="embed" />
                              <Label htmlFor="embed" className="flex items-center gap-1">
                                <PlayCircle className="w-4 h-4" /> 
                                Embed Code (Video Player)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="link" id="link" />
                              <Label htmlFor="link" className="flex items-center gap-1">
                                <LinkIcon className="w-4 h-4" /> 
                                Direkt-Link (Weiterleitung)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label htmlFor="streamUrl">
                            {streamType === 'embed' ? 'Stream URL (Embed Code)' : 'Stream URL (Direktlink)'}
                          </Label>
                          <Input 
                            id="streamUrl" 
                            placeholder={streamType === 'embed' 
                              ? "https://www.youtube.com/embed/..." 
                              : "https://www.example.com/watch?..."
                            }
                            className="mt-1"
                            value={streamUrl}
                            onChange={(e) => setStreamUrl(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            {streamType === 'embed' 
                              ? "Füge hier die Embed-URL für den Stream ein. Für YouTube-Videos nutze das Format: https://www.youtube.com/embed/VIDEO_ID" 
                              : "Füge hier einen direkten Link ein, zu dem Benutzer weitergeleitet werden sollen."
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {hasTrailer && (
                      <div className="md:col-span-2">
                        <Label htmlFor="trailerUrl">Trailer URL (YouTube Embed)</Label>
                        <Input 
                          id="trailerUrl" 
                          placeholder="https://www.youtube.com/embed/..." 
                          className="mt-1"
                          value={trailerUrl}
                          onChange={(e) => setTrailerUrl(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Füge hier die YouTube Embed-URL für den Trailer ein, z.B. https://www.youtube.com/embed/VIDEO_ID
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveMovie}>Speichern</Button>
                  </div>
                </div>
              )}
              
              {/* Serien-Bearbeitung */}
              {activeTab === 'shows' && selectedTvShow && (
                <div className="border border-border rounded-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Serie bearbeiten</h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedTvShow(null)}
                      className="text-sm"
                    >
                      Zurück zur Liste
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title">Titel</Label>
                      <Input 
                        id="title" 
                        placeholder="Breaking Bad" 
                        className="mt-1" 
                        value={selectedTvShow.name || ''}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Erscheinungsjahr</Label>
                      <Input 
                        id="year" 
                        placeholder="2008" 
                        className="mt-1" 
                        value={selectedTvShow.first_air_date?.substring(0, 4) || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <textarea 
                        id="description"
                        rows={3}
                        className="w-full mt-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Serien-Beschreibung..."
                        value={selectedTvShow.overview || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="flex flex-col md:col-span-2">
                      <div className="text-lg font-medium mb-2">Einstellungen</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasStream" 
                            checked={hasStream}
                            onCheckedChange={(checked) => setHasStream(checked as boolean)}
                          />
                          <Label htmlFor="hasStream" className="flex items-center gap-1">
                            <PlayCircle className="w-4 h-4" /> 
                            Stream verfügbar
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasTrailer" 
                            checked={hasTrailer}
                            onCheckedChange={(checked) => setHasTrailer(checked as boolean)}
                          />
                          <Label htmlFor="hasTrailer" className="flex items-center gap-1">
                            <Video className="w-4 h-4" /> 
                            Als Trailer anzeigen
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    {hasStream && (
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <Label className="mb-2 block">Stream URL Typ</Label>
                          <RadioGroup 
                            value={streamType} 
                            onValueChange={(value) => setStreamType(value as 'embed' | 'link')}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="embed" id="embed" />
                              <Label htmlFor="embed" className="flex items-center gap-1">
                                <PlayCircle className="w-4 h-4" /> 
                                Embed Code (Video Player)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="link" id="link" />
                              <Label htmlFor="link" className="flex items-center gap-1">
                                <LinkIcon className="w-4 h-4" /> 
                                Direkt-Link (Weiterleitung)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label htmlFor="streamUrl">
                            {streamType === 'embed' ? 'Stream URL (Embed Code)' : 'Stream URL (Direktlink)'}
                          </Label>
                          <Input 
                            id="streamUrl" 
                            placeholder={streamType === 'embed' 
                              ? "https://www.youtube.com/embed/..." 
                              : "https://www.example.com/watch?..."
                            }
                            className="mt-1"
                            value={streamUrl}
                            onChange={(e) => setStreamUrl(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            {streamType === 'embed' 
                              ? "Füge hier die Embed-URL für den Stream ein. Für YouTube-Videos nutze das Format: https://www.youtube.com/embed/VIDEO_ID" 
                              : "Füge hier einen direkten Link ein, zu dem Benutzer weitergeleitet werden sollen."
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {hasTrailer && (
                      <div className="md:col-span-2">
                        <Label htmlFor="trailerUrl">Trailer URL (YouTube Embed)</Label>
                        <Input 
                          id="trailerUrl" 
                          placeholder="https://www.youtube.com/embed/..." 
                          className="mt-1"
                          value={trailerUrl}
                          onChange={(e) => setTrailerUrl(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Füge hier die YouTube Embed-URL für den Trailer ein, z.B. https://www.youtube.com/embed/VIDEO_ID
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveTvShow}>Speichern</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
