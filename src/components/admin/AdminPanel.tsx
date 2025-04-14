
import { useState, useEffect } from 'react';
import { Search, FileEdit, Film, Tv, Tag, Video, PlayCircle, ShoppingCart, ExternalLink, Link as LinkIcon, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useQuery } from '@tanstack/react-query';
import { getPopularMovies, MovieOrShow } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminStats from './AdminStats';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    amazonAffiliateId, 
    setAmazonAffiliateId, 
    saveSettings 
  } = useAdminSettings();
  const [streamUrl, setStreamUrl] = useState('');
  const [hasStream, setHasStream] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieOrShow | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<MovieOrShow[]>([]);
  const [streamType, setStreamType] = useState<'embed' | 'link'>('embed');
  const [hasTrailer, setHasTrailer] = useState(false);

  // Fetch movies for admin panel
  const { data: movies = [], refetch } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: getPopularMovies
  });

  // Filter movies whenever search query changes
  useEffect(() => {
    if (activeTab === 'movies' && movies.length > 0) {
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
  }, [searchQuery, movies, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleEditMovie = (movie: MovieOrShow) => {
    setSelectedMovie(movie);
    setHasStream(!!movie.hasStream);
    setStreamUrl(movie.streamUrl || '');
    setStreamType(movie.streamUrl?.includes('embed') ? 'embed' : 'link');
    setHasTrailer(!!movie.hasTrailer);
  };

  const handleSaveMovie = () => {
    if (!selectedMovie) return;

    // Create a copy of the movies array
    const updatedMovies = movies.map(movie => {
      if (movie.id === selectedMovie.id) {
        // Update the movie with the edited values
        return {
          ...movie,
          hasStream: hasStream,
          streamUrl: hasStream ? streamUrl : undefined,
          hasTrailer: hasTrailer
        };
      }
      return movie;
    });

    // Save to localStorage to persist changes
    localStorage.setItem('adminMovies', JSON.stringify(updatedMovies));
    
    // Refresh the movie list
    refetch();
    
    // Show success message
    toast.success("Änderungen gespeichert");
    
    // Go back to movie list
    setSelectedMovie(null);
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
          <TabsTrigger value="stats">Statistiken</TabsTrigger>
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
                onClick={() => setActiveTab('movies')}
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
                onClick={() => setActiveTab('shows')}
              >
                <Tv className="w-4 h-4 mr-2" />
                Serien
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'free'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('free')}
              >
                <Video className="w-4 h-4 mr-2" />
                Kostenlose Filme
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'trailers'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('trailers')}
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
                    placeholder={`Suche ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button type="submit" className="button-primary ml-2">
                  Suchen
                </button>
              </form>

              {/* Movies Tab: Search Results */}
              {activeTab === 'movies' && !selectedMovie && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Suchergebnisse</h3>
                  {filteredMovies.length > 0 ? (
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
                                    Als Trailer markiert
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <FileEdit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'Keine Filme gefunden.' : 'Lade Filme...'}
                    </div>
                  )}
                </div>
              )}

              {/* Film Edit Form Preview */}
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
                        rows={4}
                        className="w-full mt-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Film Beschreibung..."
                        value={selectedMovie.overview || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="flex space-x-6 items-start">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasStream" 
                          checked={hasStream}
                          onCheckedChange={(checked) => setHasStream(checked as boolean)}
                        />
                        <Label htmlFor="hasStream">Stream verfügbar</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasTrailer" 
                          checked={hasTrailer}
                          onCheckedChange={(checked) => setHasTrailer(checked as boolean)}
                        />
                        <Label htmlFor="hasTrailer">Als Trailer anzeigen</Label>
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
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveMovie}>Speichern</Button>
                  </div>
                </div>
              )}

              {/* Default placeholder for other tabs */}
              {activeTab !== 'movies' && (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <FileEdit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-medium mb-2">Noch keine Inhalte</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Dies ist ein Platzhalter für {activeTab === 'shows' ? 'Serien' : 
                      activeTab === 'free' ? 'kostenlose Filme' : 
                      activeTab === 'trailers' ? 'neue Trailer' : 'Tags'}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <AdminStats />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium mb-6">Globale Einstellungen</h2>
            
            <div className="max-w-xl">
              <div className="mb-6">
                <Label htmlFor="amazonId">Amazon Affiliate ID</Label>
                <div className="flex mt-1">
                  <Input 
                    id="amazonId" 
                    value={amazonAffiliateId} 
                    onChange={(e) => setAmazonAffiliateId(e.target.value)}
                    placeholder="movieflair-21" 
                    className="flex-grow" 
                  />
                  <button onClick={saveSettings} className="button-primary ml-2">
                    Speichern
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Diese ID wird für alle Amazon Affiliate Links verwendet.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
