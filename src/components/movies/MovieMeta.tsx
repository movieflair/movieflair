
import { Star, Clock, Tv, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieMetaProps {
  year?: string;
  rating?: number;
  duration?: number;
  seasons?: number;
  episodes?: number;
  mediaType?: 'movie' | 'tv';
  className?: string;
}

const MovieMeta = ({ 
  year, 
  rating, 
  duration, 
  seasons, 
  episodes, 
  mediaType,
  className 
}: MovieMetaProps) => {
  // Format the rating to show max 1 decimal place and don't show .0
  const formattedRating = rating ? (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)) : undefined;
  
  return (
    <div className={cn("flex items-center gap-6 text-gray-600 flex-wrap", className)}>
      {mediaType && (
        <div className="flex items-center gap-1">
          {mediaType === 'movie' ? (
            <>
              <Film className="w-4 h-4" />
              <span>Film</span>
            </>
          ) : (
            <>
              <Tv className="w-4 h-4" />
              <span>Serie</span>
            </>
          )}
        </div>
      )}
      
      {year && <span>{year}</span>}
      
      {rating && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(rating / 2)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span>{formattedRating}/10</span>
        </div>
      )}
      
      {duration && duration > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{duration} Minuten</span>
        </div>
      )}

      {seasons && (
        <div className="flex items-center gap-1">
          <Tv className="w-4 h-4" />
          <span>{seasons} {seasons === 1 ? 'Staffel' : 'Staffeln'}</span>
        </div>
      )}

      {episodes && (
        <div className="flex items-center gap-1">
          <span>{episodes} {episodes === 1 ? 'Episode' : 'Episoden'}</span>
        </div>
      )}
    </div>
  );
};

export default MovieMeta;
