
import { Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import './App.css';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import MovieDetails from './pages/MovieDetails';
import TvShowDetails from './pages/TvShowDetails';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Trailers from './pages/Trailers';
import FreeMovies from './pages/FreeMovies';
import Profile from './pages/Profile';
import QuickTipp from './pages/QuickTipp';
import AdminPage from './pages/AdminPage';
import Watchlist from './pages/Watchlist';
import About from './pages/About';
import Genres from './pages/Genres';
import AllLists from './pages/AllLists';
import ListDetailPage from './pages/ListDetailPage';
import SerpSnippetGenerator from './pages/SerpSnippetGenerator';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/film/:id/:slug?" element={<MovieDetails />} />
        <Route path="/serie/:id/:slug?" element={<TvShowDetails />} />
        <Route path="/entdecken" element={<Discover />} />
        <Route path="/suche" element={<Search />} />
        <Route path="/neue-trailer" element={<Trailers />} />
        <Route path="/kostenlose-filme" element={<FreeMovies />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/quick-tipp" element={<QuickTipp />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/filmlisten" element={<AllLists />} />
        <Route path="/liste/:listId" element={<ListDetailPage />} />
        <Route path="/serp-generator" element={<SerpSnippetGenerator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner position="top-right" />
    </>
  );
}

export default App;
