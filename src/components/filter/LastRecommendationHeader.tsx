
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovieOrShow } from '@/lib/types';

interface LastRecommendationHeaderProps {
  recommendation: MovieOrShow | null;
}

const LastRecommendationHeader = ({ recommendation }: LastRecommendationHeaderProps) => {
  if (!recommendation) return null;

  const title = recommendation.title || recommendation.name || '';
  const overview = recommendation.overview?.slice(0, 200) + (recommendation.overview?.length > 200 ? '...' : '');
  const detailPath = `/film/${recommendation.id}`;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-10">
      <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
      
      {recommendation.backdrop_path && (
        <div className="absolute inset-0">
          <img 
            src={`https://image.tmdb.org/t/p/w1280${recommendation.backdrop_path}`} 
            alt={title}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}
      
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Deine letzte Filmempfehlung
            </h2>
            <h3 className="text-xl text-white mb-2">{title}</h3>
            <p className="text-white/80 max-w-2xl">
              {overview}
            </p>
          </div>
          
          <Button 
            asChild
            variant="secondary"
            className="md:self-start"
          >
            <Link to={detailPath} className="flex items-center gap-2">
              Details ansehen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LastRecommendationHeader;
