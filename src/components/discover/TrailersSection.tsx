
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';

interface TrailersSectionProps {
  movies: MovieOrShow[];
}

const TrailersSection = ({ movies }: TrailersSectionProps) => {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-bold text-slate-900">Neue Trailer</h2>
        </div>
        <Link 
          to="/trailers" 
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
            <div className="relative">
              <MovieCard movie={movie} size="small" />
              <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                <Play className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrailersSection;
