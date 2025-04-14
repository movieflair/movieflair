
import { Star, Clock } from 'lucide-react';

interface MovieMetaProps {
  year?: string;
  rating?: number;
  duration?: number;
}

const MovieMeta = ({ year, rating, duration }: MovieMetaProps) => {
  return (
    <div className="flex items-center gap-6 text-gray-300">
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
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span>{rating.toFixed(1)}/10</span>
        </div>
      )}
      
      {duration && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{duration} Minuten</span>
        </div>
      )}
    </div>
  );
};

export default MovieMeta;
