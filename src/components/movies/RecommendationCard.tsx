import { Link } from 'react-router-dom';
import { ArrowRight, Star, Calendar, Clock } from 'lucide-react';
import { MovieDetail } from '@/lib/api';
import { createUrlSlug, getMediaTypeInGerman } from '@/lib/urlUtils';

interface RecommendationCardProps {
  movie: MovieDetail;
}

const RecommendationCard = ({ movie }: RecommendationCardProps) => {
  const title = movie.title || movie.name || 'Unbekannter Titel';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const mediaType = getMediaTypeInGerman(movie.media_type);
  const slug = createUrlSlug(title);
  
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="md:flex h-full">
        <div className="w-full md:w-[300px] h-[450px] flex-shrink-0">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={title}
              className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
              <span className="text-gray-400">Kein Poster</span>
            </div>
          )}
        </div>
        
        <div className="p-6 md:w-3/4 lg:w-4/5 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 mr-1 text-yellow-600" />
              <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.map((genre) => (
              <span key={genre.id} className="px-2 py-1 text-xs bg-secondary rounded-full">
                {genre.name}
              </span>
            ))}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-4 gap-4">
            {year && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{year}</span>
              </div>
            )}
            {movie.runtime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{movie.runtime} min</span>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {movie.overview || 'Keine Beschreibung verfügbar.'}
          </p>
          
          <div className="mt-auto">
            <Link
              to={`/${mediaType}/${movie.id}/${slug}`}
              className="button-primary inline-flex items-center"
            >
              Details ansehen
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
