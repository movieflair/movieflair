
import { MovieOrShow } from "@/lib/types";
import AdminMovieList from './AdminMovieList';

interface MovieGridProps {
  movies: MovieOrShow[];
  onEditMovie: (movie: MovieOrShow) => void;
  isLoading: boolean;
  searchQuery: string;
  currentView: 'all' | 'free' | 'trailers';
}

const MovieGrid = ({ 
  movies, 
  onEditMovie, 
  isLoading,
  searchQuery,
  currentView
}: MovieGridProps) => {
  return (
    <AdminMovieList
      movies={movies}
      onEditMovie={onEditMovie}
      isLoading={isLoading}
      searchQuery={searchQuery}
      currentView={currentView}
    />
  );
};

export default MovieGrid;
