
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import { createUrlSlug, getMediaTypeInGerman } from '@/lib/urlUtils';

interface MovieCardProps {
  movie: MovieOrShow;
  size?: 'small' | 'medium' | 'large';
  hideDetails?: boolean;
}

const MovieCard = ({ movie, size = 'medium', hideDetails = false }: MovieCardProps) => {
  const title = movie.title || movie.name || 'Unbekannter Titel';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const mediaType = getMediaTypeInGerman(movie.media_type);
  const slug = createUrlSlug(title);
  
  const imageSizes = {
    small: 'h-[200px] w-[135px]',  // Reduced from 'h-[300px] w-[200px]'
    medium: 'h-[200px] w-[135px]', // Reduced from 'h-[300px] w-[200px]'
    large: 'h-[300px] w-[200px]'   // Kept the same
  };
  
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <Link 
      to={`/${mediaType}/${movie.id}/${slug}`} 
      className="group block overflow-hidden rounded-xl"
    >
      <div className={`relative ${imageSizes[size]} bg-muted overflow-hidden rounded-xl`}>
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={title}
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 text-yellow-500 mr-1" />
          <span className="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
      
      {!hideDetails && (
        <div className="p-3">
          <h3 className={`font-medium ${textSizes[size]} truncate`}>{title}</h3>
          {year && <p className="text-sm text-muted-foreground mt-1">{year}</p>}
        </div>
      )}
    </Link>
  );
};

export default MovieCard;
