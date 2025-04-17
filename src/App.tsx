import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextProviders } from '@/context';
import { ToastContext } from '@/lib/toast';
import HomePage from '@/pages/HomePage';
import MovieDetails from '@/pages/MovieDetails';
import TvShowDetails from '@/pages/TvShowDetails';
import DiscoverPage from '@/pages/DiscoverPage';
import GenrePage from '@/pages/GenrePage';
import SearchPage from '@/pages/SearchPage';
import WatchlistPage from '@/pages/WatchlistPage';
import AuthPage from '@/pages/AuthPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';
import MoviesPage from '@/pages/MoviesPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ContextProviders>
          <ToastContext>
            <RouterProvider router={router} />
          </ToastContext>
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
