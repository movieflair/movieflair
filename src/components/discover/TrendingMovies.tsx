
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';

interface TrendingMoviesProps {
  movies: MovieOrShow[];
}

const TrendingMovies = ({ movies }: TrendingMoviesProps) => {
  if (movies.length === 0) return null;
  
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900">Trending Filme</h2>
        </div>
        <Link 
          to="/kostenlose-filme" 
          className="text-sm font-medium flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          Alle anzeigen
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingMovies;
