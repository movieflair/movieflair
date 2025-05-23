
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { trackInteraction } from '@/lib/analyticsApi';

interface PrimeVideoAdProps {
  className?: string;
}

const PrimeVideoAd = ({ className = '' }: PrimeVideoAdProps) => {
  const handleClick = () => {
    trackInteraction('amazon_ad_click');
  };

  return (
    <div className={`w-full ${className}`}>
      <a 
        href="https://www.amazon.de/gp/video/primesignup?tag=moovala0d-21" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
        onClick={handleClick}
      >
        <div className="bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl shadow-lg border border-gray-100 max-w-[800px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
              <img 
                src="/lovable-uploads/d28c1de1-859b-4e2d-af52-bb809baeb0a6.png" 
                alt="Prime Video" 
                className="h-5 md:h-8 w-auto"
              />
              <div className="text-left">
                <p className="text-sm md:text-lg font-medium mb-1">Streame ähnliche Filme kostenlos auf Prime Video</p>
                <p className="text-xs md:text-sm text-gray-600">30 Tage kostenlos - Danach 9,99€ / Monat</p>
              </div>
            </div>
            <Button 
              className="bg-[#0678ff] hover:bg-[#0678ff]/90 text-white w-full md:w-auto md:min-w-[200px] text-sm md:text-base mt-2 md:mt-0"
            >
              <Play className="w-4 h-4 mr-2" />
              Gratis streamen
            </Button>
          </div>
        </div>
      </a>
    </div>
  );
};

export default PrimeVideoAd;
