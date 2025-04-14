
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import MovieDetails from './pages/MovieDetails';
import Trailers from './pages/Trailers';
import FreeMovies from './pages/FreeMovies';
import AdminPage from './pages/AdminPage';
import Search from './pages/Search';
import { AdminSettingsProvider } from './hooks/useAdminSettings';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/movie/:id" element={
          <AdminSettingsProvider>
            <MovieDetails />
          </AdminSettingsProvider>
        } />
        <Route path="/trailers" element={<Trailers />} />
        <Route path="/free-movies" element={<FreeMovies />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
};

export default App;
