
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './pages/Index';
import MovieDetails from './pages/MovieDetails';
import TvShowDetails from './pages/TvShowDetails';
import Trailers from './pages/Trailers';
import FreeMovies from './pages/FreeMovies';
import Search from './pages/Search';
import Genres from './pages/Genres';
import QuickTipp from './pages/QuickTipp';
import Watchlist from './pages/Watchlist';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import About from './pages/About';
import { AdminSettingsProvider } from './hooks/useAdminSettings';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import EnhancedLayout from './components/layout/EnhancedLayout';
import Discover from './pages/Discover';

// Adding placeholder components for Privacy and Terms pages
const PrivacyPolicy = () => (
  <EnhancedLayout>
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This privacy policy outlines how we collect, use, and protect your personal information when using our service.
      </p>
      <p>Content to be added...</p>
    </div>
  </EnhancedLayout>
);

const TermsOfService = () => (
  <EnhancedLayout>
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        By using our service, you agree to these terms of service that outline your rights and responsibilities.
      </p>
      <p>Content to be added...</p>
    </div>
  </EnhancedLayout>
);

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/film/:id/:slug?" element={
              <AdminSettingsProvider>
                <MovieDetails />
              </AdminSettingsProvider>
            } />
            <Route path="/serie/:id/:slug?" element={
              <AdminSettingsProvider>
                <TvShowDetails />
              </AdminSettingsProvider>
            } />
            <Route path="/neue-trailer" element={<Trailers />} />
            <Route path="/kostenlose-filme" element={<FreeMovies />} />
            <Route path="/suche" element={<Search />} />
            <Route path="/entdecken" element={<Discover />} />
            <Route path="/genres" element={<Discover />} />
            <Route path="/quick-tipp" element={<QuickTipp />} />
            <Route path="/merkliste" element={<Watchlist />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/datenschutz" element={<PrivacyPolicy />} />
            <Route path="/nutzungsbedingungen" element={<TermsOfService />} />
            <Route path="/ueber-uns" element={<About />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
