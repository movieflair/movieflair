
import React from 'react';
import { Star, Film, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import MovieRatingFeedback from '../../movies/MovieRatingFeedback';

interface FilterRecommendationProps {
  recommendation: MovieOrShow;
  onRefresh: () => void;
  isLoading: boolean;
}

const FilterRecommendation = ({ recommendation, onRefresh, isLoading }: FilterRecommendationProps) => {
  if (!recommendation) return null;

  const truncateOverview = (text: string, maxLength: number = 400) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };
  
  const getDetailPath = () => {
    const baseUrl = recommendation.media_type === 'movie' ? '/film' : '/serie';
    return `${baseUrl}/${recommendation.id}`;
  };

  const getImageSrc = (path?: string) => {
    if (!path) return null;
    
    // Wenn der Pfad bereits ein lokaler Storage-Pfad ist
    if (path.startsWith('/storage')) {
      return path;
    } 
    // Für die Übergangszeit: falls noch externe URLs im System sind
    else if (path.startsWith('http')) {
      console.warn('Externe Bild-URL gefunden:', path);
      // Hier könnten wir einen automatischen Download anstoßen
      return path;
    } 
    // TMDB-Pfade sollten nicht mehr vorkommen, aber zur Sicherheit:
    else if (path.startsWith('/')) {
      console.warn('TMDB-Pfad gefunden, sollte bereits importiert sein:', path);
      // Wir versuchen trotzdem, die lokale Version zu verwenden
      return `/storage/movie_images/posters/${path.replace(/^\//, '')}`;
    }
    
    // Standard: Wir nehmen an, dass es ein Dateiname in unserem Storage ist
    return `/storage/movie_images/posters/${path}`;
  };

  return (
    <div className="mt-8 animate-fade-in">
      <div className="rounded-xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-lg font-medium text-gray-800">
            Deine {recommendation.media_type === 'movie' ? 'Film' : 'Serien'}empfehlung
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="border-gray-200 text-gray-600 bg-white"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            <span>Neuer Vorschlag</span>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          {recommendation.poster_path ? (
            <Link 
              to={getDetailPath()}
              className="group block overflow-hidden rounded-xl w-full md:w-[200px]"
            >
              <div className="relative h-[300px] bg-muted overflow-hidden rounded-xl">
                <img
                  src={getImageSrc(recommendation.poster_path)}
                  alt={recommendation.title || recommendation.name}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-500 mr-1" />
                  <span className="text-xs font-medium">{recommendation.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-full md:w-[200px] h-[300px] bg-muted rounded-xl flex items-center justify-center">
              <Film className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 text-gray-900">
            <h4 className="text-xl font-medium mb-2">
              {recommendation.title || recommendation.name}
            </h4>
            <p className="text-sm mb-4">
              {recommendation.release_date?.substring(0, 4) || recommendation.first_air_date?.substring(0, 4)}
            </p>
            <p className="text-sm mb-6">
              {truncateOverview(recommendation.overview || 'Keine Beschreibung verfügbar.')}
            </p>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => window.location.href = getDetailPath()}
                className="w-full md:w-auto bg-[#ff3131] hover:bg-[#ff3131]/90 text-white flex items-center"
              >
                Details ansehen
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              {recommendation.id && (
                <div className="text-xs text-gray-600">
                  <MovieRatingFeedback movieId={recommendation.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterRecommendation;
