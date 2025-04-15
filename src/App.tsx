
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import MovieDetails from './pages/MovieDetails';
import Trailers from './pages/Trailers';
import FreeMovies from './pages/FreeMovies';
import Search from './pages/Search';
import Genres from './pages/Genres';
import QuickTipp from './pages/QuickTipp';
import Watchlist from './pages/Watchlist';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { AdminSettingsProvider } from './hooks/useAdminSettings';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/movie/:id" element={
            <AdminSettingsProvider>
              <MovieDetails />
            </AdminSettingsProvider>
          } />
          <Route path="/tv/:id" element={
            <AdminSettingsProvider>
              <MovieDetails />
            </AdminSettingsProvider>
          } />
          <Route path="/trailers" element={<Trailers />} />
          <Route path="/free-movies" element={<FreeMovies />} />
          <Route path="/search" element={<Search />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/quick-tipp" element={<QuickTipp />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
