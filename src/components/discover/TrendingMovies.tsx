
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';

interface TrendingMoviesProps {
  movies: MovieOrShow[];
}

const TrendingMovies = ({ movies }: TrendingMoviesProps) => {
  if (movies.length === 0) return null;
  
  const trendingMovies = movies.slice(0, 4);
  
  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-theme-red" />
        <h2 className="text-2xl font-bold text-theme-black">Trending Filme</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-center">
        {trendingMovies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex justify-center"
          >
            <MovieCard movie={movie} size="medium" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingMovies;
