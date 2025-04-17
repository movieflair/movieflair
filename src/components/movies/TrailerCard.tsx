
import { useState } from 'react';
import { MovieOrShow } from '@/lib/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import MovieTrailerDialog from './MovieTrailerDialog';

interface TrailerCardProps {
  movie: MovieOrShow;
}

const TrailerCard = ({ movie }: TrailerCardProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const title = movie.title || movie.name;
  
  return (
    <>
      <div className="relative aspect-video rounded-xl overflow-hidden group">
        <motion.div 
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            e.preventDefault();
            if (movie.trailerUrl) {
              setShowTrailer(true);
            }
          }}
        >
          <button 
            className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            disabled={!movie.trailerUrl}
          >
            <Play className="w-8 h-8 text-white fill-white" />
          </button>
        </motion.div>

        <Link to={`/film/${movie.id}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          
          {movie.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-card flex items-center justify-center">
              <span className="text-muted-foreground">Kein Bild verfügbar</span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h3 className="text-white font-semibold truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
        </Link>
      </div>

      <MovieTrailerDialog
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl || ''}
        movieTitle={title}
      />
    </>
  );
};

export default TrailerCard;

