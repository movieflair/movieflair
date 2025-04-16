
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';

interface FreeMoviesSectionProps {
  movies: MovieOrShow[];
}

const FreeMoviesSection = ({ movies }: FreeMoviesSectionProps) => {
  if (!movies || movies.length === 0) return null;

  const newestMovies = movies.slice(0, 2);

  return (
    <section className="rounded-2xl bg-card p-6 border shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Neueste kostenlose Filme</h2>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/kostenlose-filme">
            Alle anzeigen
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {newestMovies.map((movie, index) => (
          <motion.div 
            key={movie.id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <MovieCard movie={movie} size="medium" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FreeMoviesSection;
