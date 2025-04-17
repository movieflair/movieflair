
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useAdminSettings } from '@/hooks/useAdminSettings';
import { MovieOrShow } from "@/lib/types";
import { 
  getImportedMovies, 
  getFreeMovies, 
  getTrailerMovies,
  searchMovies, 
  searchTvShows,
  getPopularTvShows,
  getPopularMovies,
  deleteAllMovies
} from '@/lib/api';

import AdminHeader from './header/AdminHeader';
import AdminSettings from './settings/AdminSettings';
import ContentManager from './content/ContentManager';
import CustomListManager from './CustomListManager';
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
  const [isDeleting, setIsDeleting] = useState(false);
  
  const queryClient = useQueryClient();

  // Hier ändern wir die Abfrage auf die importierten Filme
  const { data: movies = [], isLoading: isLoadingMovies, refetch: refetchMovies } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: getImportedMovies
  });
  
  const { data: freeMovies = [], isLoading: isLoadingFreeMovies, refetch: refetchFreeMovies } = useQuery({
    queryKey: ['admin-free-movies'],
    queryFn: getFreeMovies
  });
  
  const { data: trailerMovies = [], isLoading: isLoadingTrailerMovies, refetch: refetchTrailerMovies } = useQuery({
    queryKey: ['admin-trailer-movies'],
    queryFn: getTrailerMovies
  });
  
  const { data: tvShows = [], isLoading: isLoadingTvShows } = useQuery({
    queryKey: ['admin-tv-shows'],
    queryFn: getPopularTvShows
  });
  
  // Für die Suche im Admin-Panel verwenden wir weiterhin die TMDB API
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

  const handleSaveMovie = async () => {
    if (!selectedMovie) return;

    try {
      toast.loading("Film wird gespeichert...");
      
      const updatedMovie = {
        id: selectedMovie.id,
        title: selectedMovie.title,
        poster_path: selectedMovie.poster_path,
        backdrop_path: selectedMovie.backdrop_path,
        overview: selectedMovie.overview,
        release_date: selectedMovie.release_date,
        vote_average: selectedMovie.vote_average,
        vote_count: selectedMovie.vote_count,
        popularity: selectedMovie.popularity,
        media_type: selectedMovie.media_type,
        isfreemovie: isFreeMovie,
        isnewtrailer: isNewTrailer,
        hasstream: isFreeMovie,
        streamurl: isFreeMovie ? streamUrl : '',
        hastrailer: isNewTrailer,
        trailerurl: isNewTrailer ? trailerUrl : ''
      };

      console.log("Speichere Film mit Daten:", updatedMovie);

      const { error: checkError } = await supabase
        .from('admin_movies')
        .select('*')
        .eq('id', selectedMovie.id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Fehler beim Überprüfen, ob der Film existiert:', checkError);
        toast.dismiss();
        toast.error("Fehler beim Überprüfen des Films");
        return;
      }
      
      const { error: saveError } = await supabase
        .from('admin_movies')
        .upsert(updatedMovie);
      
      if (saveError) {
        console.error('Fehler beim Speichern des Films in Supabase:', saveError);
        toast.dismiss();
        toast.error("Fehler beim Speichern des Films");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-free-movies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trailer-movies'] });
      queryClient.invalidateQueries({ queryKey: ['search-movies'] });
      
      toast.dismiss();
      toast.success("Änderungen gespeichert");
      setSelectedMovie(null);
    } catch (error) {
      console.error('Fehler beim Speichern des Films:', error);
      toast.dismiss();
      toast.error("Fehler beim Speichern des Films");
    }
  };
  
  const handleSaveTvShow = async () => {
    if (!selectedTvShow) return;

    try {
      const updatedShow = {
        id: selectedTvShow.id,
        name: selectedTvShow.name || selectedTvShow.title,
        poster_path: selectedTvShow.poster_path,
        backdrop_path: selectedTvShow.backdrop_path,
        overview: selectedTvShow.overview,
        first_air_date: selectedTvShow.first_air_date || selectedTvShow.release_date,
        vote_average: selectedTvShow.vote_average,
        vote_count: selectedTvShow.vote_count,
        popularity: selectedTvShow.popularity,
        media_type: selectedTvShow.media_type,
        hasstream: hasStream,
        streamurl: hasStream ? streamUrl : '',
        hastrailer: hasTrailer,
        trailerurl: hasTrailer ? trailerUrl : ''
      };

      const { error: saveError } = await supabase
        .from('admin_shows')
        .upsert(updatedShow);
      
      if (saveError) {
        console.error('Fehler beim Speichern der Show in Supabase:', saveError);
        toast.error("Fehler beim Speichern der Serie");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
      queryClient.invalidateQueries({ queryKey: ['search-tv-shows'] });
      
      toast.success("Änderungen gespeichert");
      setSelectedTvShow(null);
    } catch (error) {
      console.error('Fehler beim Speichern der TV-Show:', error);
      toast.error("Fehler beim Speichern der Serie");
    }
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
  
  const handleDeleteAllMovies = async () => {
    if (window.confirm('Sind Sie sicher, dass Sie ALLE Filme löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      setIsDeleting(true);
      
      try {
        const success = await deleteAllMovies();
        
        if (success) {
          // Aktualisiere die Listen nach dem Löschen
          await Promise.all([
            refetchMovies(),
            refetchFreeMovies(),
            refetchTrailerMovies()
          ]);
          
          setFilteredMovies([]);
          toast.success('Alle Filme wurden erfolgreich gelöscht');
        } else {
          toast.error('Fehler beim Löschen aller Filme');
        }
      } catch (error) {
        console.error('Fehler beim Löschen aller Filme:', error);
        toast.error('Fehler beim Löschen aller Filme');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container-custom py-8">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Datenbank-Management</h2>
        <p className="text-gray-600 mb-4">Wenn Sie Probleme mit der Bildanzeige haben oder neu starten möchten, können Sie alle Filme löschen.</p>
        <Button 
          variant="destructive" 
          onClick={handleDeleteAllMovies} 
          disabled={isDeleting}
        >
          {isDeleting ? 'Lösche...' : 'Alle Filme löschen'}
        </Button>
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
          <ContentManager
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentView={currentView}
            handleViewChange={handleViewChange}
            filteredMovies={filteredMovies}
            filteredTvShows={filteredTvShows}
            isSearchLoading={isSearchLoading}
            isSearchTvLoading={isSearchTvLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            handleEditMovie={handleEditMovie}
            handleEditTvShow={handleEditTvShow}
            selectedMovie={selectedMovie}
            selectedTvShow={selectedTvShow}
            onMovieSave={handleSaveMovie}
            onTvShowSave={handleSaveTvShow}
            onMovieCancel={() => setSelectedMovie(null)}
            onTvShowCancel={() => setSelectedTvShow(null)}
            isNewTrailer={isNewTrailer}
            isFreeMovie={isFreeMovie}
            streamUrl={streamUrl}
            streamType={streamType}
            trailerUrl={trailerUrl}
            hasStream={hasStream}
            hasTrailer={hasTrailer}
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
            setHasStream={setHasStream}
            setHasTrailer={setHasTrailer}
          />
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
          <AdminSettings 
            amazonAffiliateId={amazonAffiliateId}
            setAmazonAffiliateId={setAmazonAffiliateId}
            saveSettings={saveSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
