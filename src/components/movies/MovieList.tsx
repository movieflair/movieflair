
import React from 'react';
import { MovieOrShow } from '@/lib/types';
import { Eye, Calendar, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createUrlSlug } from '@/lib/urlUtils';

// Update the MovieOrShow type for runtime
declare module '@/lib/types' {
  interface MovieOrShow {
    runtime?: number;
  }
}

interface MovieListProps {
  movies: MovieOrShow[];
}

const MovieList = ({ movies }: MovieListProps) => {
  return (
    <div className="space-y-4">
      {movies.map(movie => {
        const title = movie.title || 'Unbekannter Film';
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
        const slug = createUrlSlug(title);
        const movieUrl = `/film/${movie.id}/${slug}`;
        
        // Handle image URL construction
        let posterUrl = '/placeholder.svg';
        
        if (movie.poster_path) {
          if (movie.poster_path.startsWith('/storage')) {
            posterUrl = window.location.origin + movie.poster_path;
          } else if (movie.poster_path.startsWith('http')) {
            posterUrl = movie.poster_path;
          } else {
            posterUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
          }
        }
        
        return (
          <div 
            key={movie.id} 
            className="flex bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="w-20 h-28 md:w-32 md:h-44 flex-shrink-0">
              <img 
                src={posterUrl} 
                alt={title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            
            <div className="flex flex-col flex-grow p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{title}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={16} className="fill-amber-500" />
                  <span>{movie.vote_average?.toFixed(1) || '?'}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 my-2 text-sm text-gray-600">
                {year && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{year}</span>
                  </div>
                )}
                
                {movie.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                
                {movie.isFreeMovie && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Kostenlos
                  </span>
                )}
                
                {movie.isNewTrailer && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Neuer Trailer
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mt-1 mb-auto">
                {movie.overview || 'Keine Beschreibung verfügbar.'}
              </p>
              
              <div className="mt-3">
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link to={movieUrl}>
                    <Eye size={16} />
                    <span>Details ansehen</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MovieList;
