
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

  // Sort movies by updated_at in descending order (newest first)
  // If updated_at is not available, fallback to release_date or first_air_date
  const sortedMovies = [...movies].sort((a, b) => {
    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 
                 a.release_date ? new Date(a.release_date).getTime() : 
                 a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
    
    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 
                 b.release_date ? new Date(b.release_date).getTime() : 
                 b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
    
    return dateB - dateA; // Descending order
  });

  const newestTrailers = sortedMovies.slice(0, 2);

  return (
    <section className="rounded-2xl bg-card p-6 border shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Neueste Trailer</h2>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/neue-trailer">
            Alle anzeigen
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {newestTrailers.map((movie, index) => (
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

export default TrailersSection;
