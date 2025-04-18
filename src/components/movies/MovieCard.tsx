
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import { createUrlSlug, getMediaTypeInGerman } from '@/lib/urlUtils';
import { scrollToTop } from '@/utils/scrollUtils';
import { TMDBImage } from '@/components/ui/tmdb-image';

interface MovieCardProps {
  movie: MovieOrShow;
  size?: 'small' | 'medium' | 'large';
  hideDetails?: boolean;
  prioritizeImage?: boolean; // New prop for prioritizing images
}

const MovieCard = ({ 
  movie, 
  size = 'medium', 
  hideDetails = false,
  prioritizeImage = false
}: MovieCardProps) => {
  const title = movie.title || movie.name || 'Unbekannter Titel';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const mediaType = getMediaTypeInGerman(movie.media_type);
  const slug = createUrlSlug(title);
  
  const imageSizes = {
    small: 'h-[250px] w-[170px]',
    medium: 'h-[250px] w-[170px]',
    large: 'h-[270px] w-[190px]'
  };
  
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-base'
  };

  const handleClick = () => {
    scrollToTop();
  };

  return (
    <Link 
      to={`/${mediaType}/${movie.id}/${slug}`} 
      className="group block overflow-hidden rounded-xl"
      onClick={handleClick}
    >
      <div className={`relative ${imageSizes[size]} bg-muted overflow-hidden rounded-xl`}>
        <TMDBImage
          path={movie.poster_path}
          alt={title}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          priority={prioritizeImage}
        />
        
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
