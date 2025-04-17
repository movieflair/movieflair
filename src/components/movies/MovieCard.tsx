
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import { createUrlSlug, getMediaTypeInGerman } from '@/lib/urlUtils';
import { scrollToTop } from '@/utils/scrollUtils';

interface MovieCardProps {
  movie: MovieOrShow;
  size?: 'small' | 'medium' | 'large';
  hideDetails?: boolean;
}

const MovieCard = ({ movie, size = 'medium', hideDetails = false }: MovieCardProps) => {
  const title = movie.title || movie.name || 'Unbekannter Titel';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear().toString() : '';
  const mediaType = getMediaTypeInGerman(movie.media_type);
  const slug = createUrlSlug(title);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const posterPath = movie.poster_path;
    if (!posterPath) {
      setImageSrc(null);
      return;
    }
    
    // Direkte URL-Konstruktion basierend auf Pfadtyp
    if (posterPath.startsWith('/storage/')) {
      // Vollständige URL für Storage-Pfade
      const fullUrl = window.location.origin + posterPath;
      setImageSrc(fullUrl);
    } else if (posterPath.startsWith('http')) {
      // Externe URLs direkt verwenden
      setImageSrc(posterPath);
    } else if (posterPath.startsWith('/')) {
      // TMDB-Pfade
      setImageSrc(`https://image.tmdb.org/t/p/w500${posterPath}`);
    } else {
      // Fallback für ungültige Pfade
      setImageSrc(null);
    }
    
    setHasError(false);
  }, [movie.poster_path]);
  
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

  const handleImageError = () => {
    if (!hasError && movie.poster_path) {
      console.log('MovieCard: Bild konnte nicht geladen werden:', movie.poster_path);
      setHasError(true);
      
      if (movie.poster_path.startsWith('/storage/')) {
        // Versuche einen Fallback für Storage-Bilder
        setImageSrc(null);
      } else if (movie.poster_path.startsWith('/') && !movie.poster_path.startsWith('/storage/')) {
        // Versuche einen TMDB-Fallback
        setImageSrc(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
      } else {
        setImageSrc(null);
      }
    } else {
      setImageSrc(null);
    }
  };

  return (
    <Link 
      to={`/${mediaType}/${movie.id}/${slug}`} 
      className="group block overflow-hidden rounded-xl"
      onClick={handleClick}
    >
      <div className={`relative ${imageSizes[size]} bg-muted overflow-hidden rounded-xl`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl">
            <span className="text-muted-foreground">Kein Bild</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 text-yellow-500 mr-1" />
          <span className="text-xs font-medium">{movie.vote_average?.toFixed(1) || '0.0'}</span>
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
