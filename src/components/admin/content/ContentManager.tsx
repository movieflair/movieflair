import { useState, useEffect } from 'react';
import { MovieOrShow } from "@/lib/types";
import AdminSearch from '../search/AdminSearch';
import MovieGrid from '../movies/MovieGrid';
import ShowGrid from '../shows/ShowGrid';
import MovieEditForm from '../MovieEditForm';
import TvShowEditForm from '../TvShowEditForm';
import AdminContentTabs from '../AdminContentTabs';
import { supabase } from '@/integrations/supabase/client';
import { getMovieById } from '@/lib/api';
import { importMoviesFromLists } from '@/lib/customListApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, Import } from 'lucide-react';

interface ContentManagerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentView: 'all' | 'free' | 'trailers';
  handleViewChange: (view: 'all' | 'free' | 'trailers') => void;
  filteredMovies: MovieOrShow[];
  filteredTvShows: MovieOrShow[];
  isSearchLoading: boolean;
  isSearchTvLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  handleEditMovie: (movie: MovieOrShow) => void;
  handleEditTvShow: (show: MovieOrShow) => void;
  selectedMovie: MovieOrShow | null;
  selectedTvShow: MovieOrShow | null;
  onMovieSave: () => void;
  onTvShowSave: () => void;
  onMovieCancel: () => void;
  onTvShowCancel: () => void;
  isNewTrailer: boolean;
  isFreeMovie: boolean;
  streamUrl: string;
  streamType: 'embed' | 'link';
  trailerUrl: string;
  hasStream: boolean;
  hasTrailer: boolean;
  onTrailerChange: (checked: boolean) => void;
  onFreeMovieChange: (checked: boolean) => void;
  setStreamType: (type: 'embed' | 'link') => void;
  setStreamUrl: (url: string) => void;
  setTrailerUrl: (url: string) => void;
  setHasStream: (has: boolean) => void;
  setHasTrailer: (has: boolean) => void;
}

const ContentManager = ({
  activeTab,
  setActiveTab,
  currentView,
  handleViewChange,
  filteredMovies,
  filteredTvShows,
  isSearchLoading,
  isSearchTvLoading,
  searchQuery,
  setSearchQuery,
  onSearch,
  handleEditMovie,
  handleEditTvShow,
  selectedMovie,
  selectedTvShow,
  onMovieSave,
  onTvShowSave,
  onMovieCancel,
  onTvShowCancel,
  isNewTrailer,
  isFreeMovie,
  streamUrl,
  streamType,
  trailerUrl,
  hasStream,
  hasTrailer,
  onTrailerChange,
  onFreeMovieChange,
  setStreamType,
  setStreamUrl,
  setTrailerUrl,
  setHasStream,
  setHasTrailer,
}: ContentManagerProps) => {
  const [importingMovie, setImportingMovie] = useState(false);
  const [processedMovies, setProcessedMovies] = useState<Record<number, boolean>>({});
  const [isImportingFromLists, setIsImportingFromLists] = useState(false);

  useEffect(() => {
    const checkImportedMovies = async () => {
      if (filteredMovies.length === 0) return;
      
      const movieIds = filteredMovies.map(movie => movie.id);
      
      try {
        const { data, error } = await supabase
          .from('admin_movies')
          .select('id')
          .in('id', movieIds);
        
        if (error) {
          console.error('Error checking imported movies:', error);
          return;
        }
        
        const importedIds = new Set(data?.map(item => item.id) || []);
        
        const processed: Record<number, boolean> = {};
        filteredMovies.forEach(movie => {
          processed[movie.id] = importedIds.has(movie.id);
          movie.isImported = importedIds.has(movie.id);
        });
        
        setProcessedMovies(processed);
      } catch (error) {
        console.error('Error processing imported movies:', error);
      }
    };
    
    checkImportedMovies();
  }, [filteredMovies]);

  const handleImportFromLists = async () => {
    if (isImportingFromLists) return;
    
    try {
      setIsImportingFromLists(true);
      toast.loading('Filme aus Listen werden importiert...');
      
      const result = await importMoviesFromLists();
      
      toast.dismiss();
      if (result.success > 0) {
        toast.success(`${result.success} Filme erfolgreich importiert`);
      }
      if (result.error > 0) {
        toast.error(`${result.error} Filme konnten nicht importiert werden`);
      }
      if (result.success === 0 && result.error === 0) {
        toast.info('Keine neuen Filme zum Importieren gefunden');
      }
      
      if (result.success > 0) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error importing from lists:', error);
      toast.dismiss();
      toast.error('Fehler beim Importieren der Filme aus Listen');
    } finally {
      setIsImportingFromLists(false);
    }
  };

  const handleImportMovie = async (movie: MovieOrShow) => {
    if (importingMovie) return;
    
    try {
      setImportingMovie(true);
      toast.loading('Film wird importiert...');
      
      const fullMovieData = await getMovieById(movie.id);
      
      const { error } = await supabase
        .from('admin_movies')
        .upsert({
          id: movie.id,
          title: movie.title || '',
          poster_path: movie.poster_path || '',
          backdrop_path: movie.backdrop_path || '',
          overview: movie.overview || '',
          release_date: movie.release_date || '',
          vote_average: movie.vote_average || 0,
          vote_count: movie.vote_count || 0,
          popularity: movie.popularity || 0,
          media_type: 'movie',
          isfreemovie: false,
          isnewtrailer: false,
          hasstream: false,
          streamurl: '',
          hastrailer: !!fullMovieData.videos?.results?.some((v: any) => v.type === 'Trailer'),
          trailerurl: fullMovieData.videos?.results?.find((v: any) => v.type === 'Trailer')?.key ? 
            `https://www.youtube.com/embed/${fullMovieData.videos.results.find((v: any) => v.type === 'Trailer').key}` : ''
        });
      
      if (error) {
        console.error('Error importing movie:', error);
        toast.dismiss();
        toast.error('Fehler beim Importieren des Films');
        return;
      }
      
      await downloadMovieImagesToServer(movie);
      
      setProcessedMovies(prev => ({...prev, [movie.id]: true}));
      movie.isImported = true;
      
      toast.dismiss();
      toast.success('Film erfolgreich importiert');
    } catch (error) {
      console.error('Error importing movie:', error);
      toast.dismiss();
      toast.error('Fehler beim Importieren des Films');
    } finally {
      setImportingMovie(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <AdminContentTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentView={currentView}
        handleViewChange={handleViewChange}
      />

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <AdminSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={onSearch}
            isLoading={isSearchLoading || isSearchTvLoading}
            activeTab={activeTab}
          />
          
          {activeTab === 'movies' && !selectedMovie && (
            <Button
              variant="outline"
              onClick={handleImportFromLists}
              disabled={isImportingFromLists}
              className="ml-4"
            >
              {isImportingFromLists ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" cy="12" r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  Importiere...
                </div>
              ) : (
                <>
                  <Import className="h-4 w-4 mr-2" />
                  Filme aus Listen importieren
                </>
              )}
            </Button>
          )}
        </div>

        {activeTab === 'movies' && selectedMovie && (
          <MovieEditForm
            selectedMovie={selectedMovie}
            isNewTrailer={isNewTrailer}
            isFreeMovie={isFreeMovie}
            streamUrl={streamUrl}
            streamType={streamType}
            trailerUrl={trailerUrl}
            onTrailerChange={onTrailerChange}
            onFreeMovieChange={onFreeMovieChange}
            setStreamType={setStreamType}
            setStreamUrl={setStreamUrl}
            setTrailerUrl={setTrailerUrl}
            onSave={onMovieSave}
            onCancel={onMovieCancel}
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
            onSave={onTvShowSave}
            onCancel={onTvShowCancel}
          />
        )}

        {activeTab === 'movies' && !selectedMovie && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">
              {searchQuery 
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
              isLoading={isSearchLoading}
              searchQuery={searchQuery}
              currentView={currentView}
              onImportMovie={handleImportMovie}
            />
          </div>
        )}

        {activeTab === 'shows' && !selectedTvShow && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">
              {searchQuery 
                ? `Suchergebnisse für "${searchQuery}"`
                : 'Beliebte Serien'
              }
            </h3>
            
            <ShowGrid
              shows={filteredTvShows}
              onEditShow={handleEditTvShow}
              isLoading={isSearchTvLoading}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
