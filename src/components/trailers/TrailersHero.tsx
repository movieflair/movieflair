
import { Link } from 'react-router-dom';
import { ArrowLeft, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovieOrShow } from '@/lib/api';

interface TrailersHeroProps {
  trailerItems: MovieOrShow[];
}

const TrailersHero = ({ trailerItems }: TrailersHeroProps) => {
  const featuredBackdrop = trailerItems[0]?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${trailerItems[0].backdrop_path}` 
    : '/movieflair-logo.png';

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Link to="/entdecken" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Zurück zu Entdecken
        </Link>
        <span className="text-xs text-muted-foreground ml-auto">v2.0.2</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
        
        {trailerItems.length > 0 && trailerItems[0].backdrop_path && (
          <div className="absolute inset-0">
            <img 
              src={featuredBackdrop}
              alt="Neue Trailer"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Neue Trailer</h1>
              <p className="text-white/80 max-w-2xl text-lg">
                Entdecke die neuesten Trailer zu kommenden Filmen und Serien – Alle Trailer auf einen Blick. Immer aktuell.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                asChild
                variant="secondary"
                className="flex items-center gap-2"
              >
                <a 
                  href="https://www.youtube.com/@movieflair_trailer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Youtube className="w-5 h-5" />
                  MovieFlair Trailer
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrailersHero;
