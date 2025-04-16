
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';

interface FreeMoviesSectionProps {
  movies: MovieOrShow[];
}

const FreeMoviesSection = ({ movies }: FreeMoviesSectionProps) => {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Kostenlose Filme</h2>
        </div>
        <Link 
          to="/kostenlos" 
          className="text-sm font-medium flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          Alle anzeigen
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {movies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <MovieCard movie={movie} size="small" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FreeMoviesSection;
