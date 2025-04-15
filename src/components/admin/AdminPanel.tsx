
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit } from 'lucide-react';
import { toast } from "sonner";

import { useAdminSettings } from '@/hooks/useAdminSettings';
import { MovieOrShow } from "@/lib/types";
import { 
  getPopularMovies, 
  getFreeMovies, 
  getTrailerMovies,
  searchMovies, 
  searchTvShows,
  getPopularTvShows 
} from '@/lib/api';

import AdminHeader from './header/AdminHeader';
import AdminSearch from './search/AdminSearch';
import MovieGrid from './movies/MovieGrid';
import ShowGrid from './shows/ShowGrid';
import MovieEditForm from './MovieEditForm';
import TvShowEditForm from './TvShowEditForm';
import AdminContentTabs from './AdminContentTabs';
import CustomListManager from './CustomListManager';
import AdminStats from './AdminStats';
import AdminVisitorStats from './AdminVisitorStats';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
        setFilteredMovies(freeMovies as MovieOrShow[]);
      } else if (currentView === 'trailers') {
        setFilteredMovies(trailerMovies as MovieOrShow[]);
      } else {
        if (!searchQuery.trim()) {
          setFilteredMovies(movies as MovieOrShow[]);
        } else {
          const query = searchQuery.toLowerCase().trim();
          const filtered = (movies as MovieOrShow[]).filter(movie => 
            (movie.title?.toLowerCase() || '').includes(query)
          );
          setFilteredMovies(filtered);
        }
      }
    } else if (activeTab === 'movies' && isSearching) {
      setFilteredMovies(searchResults as MovieOrShow[]);
    } else if (activeTab === 'shows' && !isSearching) {
      if (!searchQuery.trim()) {
        setFilteredTvShows(tvShows as MovieOrShow[]);
      } else {
        const query = searchQuery.toLowerCase().trim();
        const filtered = (tvShows as MovieOrShow[]).filter(show => 
          (show.name?.toLowerCase() || '').includes(query)
        );
        setFilteredTvShows(filtered);
      }
    } else if (activeTab === 'shows' && isSearching) {
      setFilteredTvShows(searchTvResults as MovieOrShow[]);
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
        setFilteredMovies(currentView === 'free' ? freeMovies as MovieOrShow[] : 
                         currentView === 'trailers' ? trailerMovies as MovieOrShow[] : movies as MovieOrShow[]);
      } else if (activeTab === 'shows') {
        setFilteredTvShows(tvShows as MovieOrShow[]);
      }
    }
  };

  const handleEditMovie = (movie: MovieOrShow) => {
    setSelectedMovie(movie);
    setSelectedTvShow(null);
    setIsFreeMovie(movie.isFreeMovie || false);
    setIsNewTrailer(movie.isNewTrailer || false);
    setStreamUrl(movie.streamUrl || '');
    setStreamType(movie.streamUrl?.includes('embed') ? 'embed' : 'link');
    setTrailerUrl(movie.trailerUrl || '');
    setHasStream(movie.isFreeMovie || false);
    setHasTrailer(movie.isNewTrailer || false);
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

    console.log("Saving movie with these settings:", {
      id: selectedMovie.id,
      title: selectedMovie.title,
      isFreeMovie,
      isNewTrailer,
      streamUrl: isFreeMovie ? streamUrl : '',
      trailerUrl: isNewTrailer ? trailerUrl : ''
    });

    const savedMoviesJson = localStorage.getItem('adminMovies');
    let savedMovies: any[] = [];
    
    if (savedMoviesJson) {
      try {
        savedMovies = JSON.parse(savedMoviesJson);
        console.log("Found existing saved movies:", savedMovies.length);
      } catch (e) {
        console.error('Error parsing saved movies:', e);
      }
    }
    
    const existingIndex = savedMovies.findIndex(m => m.id === selectedMovie.id);
    
    const updatedMovie = {
      ...selectedMovie,
      isFreeMovie,
      isNewTrailer,
      hasStream: isFreeMovie, 
      streamUrl: isFreeMovie ? streamUrl : '',
      hasTrailer: isNewTrailer,
      trailerUrl: isNewTrailer ? trailerUrl : ''
    };
    
    if (existingIndex >= 0) {
      console.log("Updating existing movie at index:", existingIndex);
      savedMovies[existingIndex] = updatedMovie;
    } else {
      console.log("Adding new movie to saved movies");
      savedMovies.push(updatedMovie);
    }
    
    localStorage.setItem('adminMovies', JSON.stringify(savedMovies));
    console.log("Saved movies to localStorage, count:", savedMovies.length);
    
    queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
    queryClient.invalidateQueries({ queryKey: ['admin-free-movies'] });
    queryClient.invalidateQueries({ queryKey: ['admin-trailer-movies'] });
    queryClient.invalidateQueries({ queryKey: ['search-movies'] });
    
    toast.success("Änderungen gespeichert");
    
    setSelectedMovie(null);
  };
  
  const handleSaveTvShow = () => {
    if (!selectedTvShow) return;

    console.log("Saving TV show with these settings:", {
      id: selectedTvShow.id,
      name: selectedTvShow.name,
      hasStream,
      hasTrailer,
      streamUrl: hasStream ? streamUrl : '',
      trailerUrl: hasTrailer ? trailerUrl : ''
    });

    const savedShowsJson = localStorage.getItem('adminShows');
    let savedShows: any[] = [];
    
    if (savedShowsJson) {
      try {
        savedShows = JSON.parse(savedShowsJson);
        console.log("Found existing saved shows:", savedShows.length);
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
      console.log("Updating existing show at index:", existingIndex);
      savedShows[existingIndex] = updatedShow;
    } else {
      console.log("Adding new show to saved shows");
      savedShows.push(updatedShow);
    }
    
    localStorage.setItem('adminShows', JSON.stringify(savedShows));
    console.log("Saved shows to localStorage, count:", savedShows.length);
    
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
      <AdminHeader onLogout={handleLogout} />

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
              <AdminSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                isLoading={isSearchLoading || isSearchTvLoading}
                activeTab={activeTab}
              />

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
                  
                  <MovieGrid
                    movies={filteredMovies}
                    onEditMovie={handleEditMovie}
                    isLoading={isSearchLoading || isLoadingMovies || isLoadingFreeMovies || isLoadingTrailerMovies}
                    searchQuery={searchQuery}
                    currentView={currentView}
                  />
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
                  
                  <ShowGrid
                    shows={filteredTvShows}
                    onEditShow={handleEditTvShow}
                    isLoading={isSearchTvLoading || isLoadingTvShows}
                    searchQuery={searchQuery}
                  />
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
