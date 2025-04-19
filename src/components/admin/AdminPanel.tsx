
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useAdminMovie } from '@/hooks/useAdminMovie';
import { useAdminTvShow } from '@/hooks/useAdminTvShow';
import { useAdminSearch } from '@/hooks/useAdminSearch';

import AdminHeader from './header/AdminHeader';
import AdminSettings from './settings/AdminSettings';
import ContentManager from './content/ContentManager';
import CustomListManager from './CustomListManager';
import AdminStats from './AdminStats';
import AdminVisitorStats from './AdminVisitorStats';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('content');
  const { 
    amazonAffiliateId, 
    setAmazonAffiliateId, 
    saveSettings 
  } = useAdminSettings();

  const {
    selectedMovie,
    isFreeMovie,
    isNewTrailer,
    streamUrl: movieStreamUrl,
    streamType: movieStreamType,
    trailerUrl: movieTrailerUrl,
    setSelectedMovie,
    setIsFreeMovie,
    setIsNewTrailer,
    setStreamUrl: setMovieStreamUrl,
    setStreamType: setMovieStreamType,
    setTrailerUrl: setMovieTrailerUrl,
    handleEditMovie,
    handleSaveMovie
  } = useAdminMovie();

  const {
    selectedTvShow,
    hasStream,
    hasTrailer,
    streamUrl: tvStreamUrl,
    streamType: tvStreamType,
    trailerUrl: tvTrailerUrl,
    setSelectedTvShow,
    setHasStream,
    setHasTrailer,
    setStreamUrl: setTvStreamUrl,
    setStreamType: setTvStreamType,
    setTrailerUrl: setTvTrailerUrl,
    handleEditTvShow,
    handleSaveTvShow
  } = useAdminTvShow();

  const {
    searchQuery,
    setSearchQuery,
    currentView,
    filteredMovies,
    filteredTvShows,
    isSearchLoading,
    isSearchTvLoading,
    handleSearch,
    handleViewChange
  } = useAdminSearch(activeTab);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
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
            streamUrl={selectedMovie ? movieStreamUrl : tvStreamUrl}
            streamType={selectedMovie ? movieStreamType : tvStreamType}
            trailerUrl={selectedMovie ? movieTrailerUrl : tvTrailerUrl}
            hasStream={hasStream}
            hasTrailer={hasTrailer}
            onTrailerChange={setIsNewTrailer}
            onFreeMovieChange={setIsFreeMovie}
            setStreamType={selectedMovie ? setMovieStreamType : setTvStreamType}
            setStreamUrl={selectedMovie ? setMovieStreamUrl : setTvStreamUrl}
            setTrailerUrl={selectedMovie ? setMovieTrailerUrl : setTvTrailerUrl}
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
