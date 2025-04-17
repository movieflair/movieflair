
import React from 'react';
import { MovieOrShow } from '@/lib/types';
import MovieCard from '@/components/movies/MovieCard';

interface MovieGridProps {
  movies: MovieOrShow[];
}

const MovieGrid = ({ movies }: MovieGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;
