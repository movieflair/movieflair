import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';

interface MovieCardProps {
  movie: MovieOrShow;
  size?: 'small' | 'medium' | 'large';
}

const MovieCard = ({ movie, size = 'medium' }: MovieCardProps) => {
  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  
  const imageSizes = {
    small: 'h-[150px] w-[100px]',
    medium: 'h-[260px] w-[170px]',
    large: 'h-[300px] w-[200px]'
  };
  
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <Link 
      to={`/${movie.media_type}/${movie.id}`} 
      className="group block overflow-hidden card-hover rounded-lg"
    >
      <div className={`relative ${imageSizes[size]} bg-muted overflow-hidden`}>
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 text-yellow-500 mr-1" />
          <span className="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className={`font-medium ${textSizes[size]} truncate`}>{title}</h3>
        {year && <p className="text-sm text-muted-foreground mt-1">{year}</p>}
      </div>
    </Link>
  );
};

export default MovieCard;
