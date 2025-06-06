
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from './components/layout/MainLayout';
import Discover from './pages/Discover';
import ListDetailPage from './pages/ListDetailPage';
import AllLists from './pages/AllLists';
import NotFound from './pages/NotFound';

const PrivacyPolicy = () => (
  <MainLayout>
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
      <p className="prose max-w-none">
        Hier finden Sie detaillierte Informationen zum Schutz und zur Verarbeitung Ihrer persönlichen Daten bei MovieFlair. 
        Wir legen großen Wert auf Transparenz und den verantwortungsvollen Umgang mit Ihren Daten.
      </p>
      {/* Placeholder for more detailed privacy policy content */}
    </div>
  </MainLayout>
);

const TermsOfService = () => (
  <MainLayout>
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-6">Nutzungsbedingungen</h1>
      <p className="prose max-w-none">
        Die folgenden Nutzungsbedingungen regeln Ihre Nutzung des MovieFlair-Services. 
        Durch die Nutzung unserer Plattform erkennen Sie diese Bedingungen an.
      </p>
      {/* Placeholder for more detailed terms of service content */}
    </div>
  </MainLayout>
);

const MovieRedirect = () => {
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  return <Navigate to={`/film/${id}`} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/film/:id/:slug?" element={<MovieDetails />} />
        <Route path="/movie/:id" element={<MovieRedirect />} />
        <Route path="/serie/:id/:slug?" element={<TvShowDetails />} />
        <Route path="/neue-trailer" element={<Trailers />} />
        <Route path="/kostenlose-filme" element={<FreeMovies />} />
        <Route path="/suche" element={<Search />} />
        <Route path="/search" element={<Navigate to="/suche" replace />} />
        <Route path="/entdecken" element={<Discover />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/liste/:slug" element={<ListDetailPage />} />
        <Route path="/liste/:id/:slug" element={<Navigate to={`/liste/${window.location.pathname.split('/').pop()}`} replace />} />
        <Route path="/filmlisten" element={<AllLists />} />
        <Route path="/listen" element={<Navigate to="/filmlisten" replace />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/quick-tipp" element={<QuickTipp />} />
        <Route path="/merkliste" element={<Watchlist />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/datenschutz" element={<PrivacyPolicy />} />
        <Route path="/nutzungsbedingungen" element={<TermsOfService />} />
        <Route path="/ueber-uns" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
