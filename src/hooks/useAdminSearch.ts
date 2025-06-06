
import { useState } from 'react';
import { MovieOrShow } from "@/lib/types";
import { useQuery } from '@tanstack/react-query';
import { 
  searchMovies, 
  searchTvShows,
  getPopularMovies,
  getPopularTvShows,
  getFreeMovies,
  getTrailerMovies
} from '@/lib/api';

export const useAdminSearch = (activeTab: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<'all' | 'free' | 'trailers'>('all');
  const [filteredMovies, setFilteredMovies] = useState<MovieOrShow[]>([]);
  const [filteredTvShows, setFilteredTvShows] = useState<MovieOrShow[]>([]);

  const { 
    data: movies = [], 
    isLoading: isLoadingMovies 
  } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: getPopularMovies
  });
  
  const { 
    data: freeMovies = [], 
    isLoading: isLoadingFreeMovies 
  } = useQuery({
    queryKey: ['admin-free-movies'],
    queryFn: getFreeMovies
  });
  
  const { 
    data: trailerMovies = [], 
    isLoading: isLoadingTrailerMovies 
  } = useQuery({
    queryKey: ['admin-trailer-movies'],
    queryFn: getTrailerMovies
  });
  
  const { 
    data: tvShows = [], 
    isLoading: isLoadingTvShows 
  } = useQuery({
    queryKey: ['admin-tv-shows'],
    queryFn: getPopularTvShows
  });

  const { 
    data: searchResults = [], 
    isLoading: isSearchLoading,
    refetch: refetchSearch 
  } = useQuery({
    queryKey: ['search-movies', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: false,
  });
  
  const { 
    data: searchTvResults = [], 
    isLoading: isSearchTvLoading,
    refetch: refetchTvSearch 
  } = useQuery({
    queryKey: ['search-tv-shows', searchQuery],
    queryFn: () => searchTvShows(searchQuery),
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setIsSearching(true);
      if (activeTab === 'movies') {
        const results = await refetchSearch();
        setFilteredMovies(results.data || []);
      } else if (activeTab === 'shows') {
        const results = await refetchTvSearch();
        setFilteredTvShows(results.data || []);
      }
    } else {
      setIsSearching(false);
      if (activeTab === 'movies') {
        setFilteredMovies(
          currentView === 'free' ? freeMovies :
          currentView === 'trailers' ? trailerMovies :
          movies
        );
      } else if (activeTab === 'shows') {
        setFilteredTvShows(tvShows);
      }
    }
  };

  const handleViewChange = (view: 'all' | 'free' | 'trailers') => {
    setCurrentView(view);
    setIsSearching(false);
    setSearchQuery('');
    
    if (view === 'free') {
      setFilteredMovies(freeMovies);
    } else if (view === 'trailers') {
      setFilteredMovies(trailerMovies);
    } else {
      setFilteredMovies(movies);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    currentView,
    filteredMovies,
    filteredTvShows,
    isLoadingMovies,
    isLoadingFreeMovies,
    isLoadingTrailerMovies,
    isLoadingTvShows,
    isSearchLoading,
    isSearchTvLoading,
    handleSearch,
    handleViewChange,
    setFilteredMovies,
    setFilteredTvShows
  };
};
