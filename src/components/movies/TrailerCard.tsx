
import { MovieOrShow } from '@/lib/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TrailerCardProps {
  movie: MovieOrShow;
}

const TrailerCard = ({ movie }: TrailerCardProps) => {
  const title = movie.title || movie.name;
  
  return (
    <Link to={`/film/${movie.id}`}>
      <motion.div 
        className="relative aspect-video rounded-xl overflow-hidden group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
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
      </motion.div>
    </Link>
  );
};

export default TrailerCard;
