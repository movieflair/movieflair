
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';
import MovieDetails from '@/pages/MovieDetails';
import TvShowDetails from '@/pages/TvShowDetails';
import AdminPage from '@/pages/AdminPage';
import MoviesPage from '@/pages/MoviesPage';

// Let's create temporary components for pages that don't exist
import MainLayout from '@/components/layout/MainLayout';

const queryClient = new QueryClient();

// Create context providers wrapper
const ContextProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>{children}</AuthProvider>
  );
};

// Temporary components for missing pages
const HomePage = () => <MainLayout><div className="container-custom py-12"><h1>Home Page</h1></div></MainLayout>;
const DiscoverPage = () => <MainLayout><div className="container-custom py-12"><h1>Discover Page</h1></div></MainLayout>;
const GenrePage = () => <MainLayout><div className="container-custom py-12"><h1>Genre Page</h1></div></MainLayout>;
const SearchPage = () => <MainLayout><div className="container-custom py-12"><h1>Search Page</h1></div></MainLayout>;
const WatchlistPage = () => <MainLayout><div className="container-custom py-12"><h1>Watchlist Page</h1></div></MainLayout>;
const AuthPage = () => <MainLayout><div className="container-custom py-12"><h1>Auth Page</h1></div></MainLayout>;
const NotFoundPage = () => <MainLayout><div className="container-custom py-12"><h1>404 - Page Not Found</h1></div></MainLayout>;

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ContextProviders>
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors />
        </ContextProviders>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/film/:id",
    element: <MovieDetails />,
  },
  {
    path: "/film/:id/:slug",
    element: <MovieDetails />,
  },
  {
    path: "/serie/:id",
    element: <TvShowDetails />,
  },
  {
    path: "/serie/:id/:slug",
    element: <TvShowDetails />,
  },
  {
    path: "/entdecken",
    element: <DiscoverPage />,
  },
  {
    path: "/genres",
    element: <GenrePage />,
  },
  {
    path: "/suche",
    element: <SearchPage />,
  },
  {
    path: "/watchlist",
    element: <WatchlistPage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/movies",
    element: <MoviesPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default App;
