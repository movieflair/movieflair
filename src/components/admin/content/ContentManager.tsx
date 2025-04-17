
import { useState } from 'react';
import { MovieOrShow } from "@/lib/types";
import AdminSearch from '../search/AdminSearch';
import MovieGrid from '../movies/MovieGrid';
import ShowGrid from '../shows/ShowGrid';
import MovieEditForm from '../MovieEditForm';
import TvShowEditForm from '../TvShowEditForm';
import AdminContentTabs from '../AdminContentTabs';

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
  return (
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
          onSearch={onSearch}
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
