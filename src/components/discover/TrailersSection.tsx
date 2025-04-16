
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';

interface TrailersSectionProps {
  movies: MovieOrShow[];
}

const TrailersSection = ({ movies }: TrailersSectionProps) => {
  if (!movies || movies.length === 0) return null;

  const newestTrailers = movies.slice(0, 2);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-theme-black" />
          <h2 className="text-xl font-bold text-theme-black">Neuste Trailer</h2>
        </div>
        <Link to="/trailers">
          <Button variant="outline" size="sm">
            Alle anzeigen
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {newestTrailers.map((movie, index) => (
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
