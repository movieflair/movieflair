
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const PrimeVideoAd = () => {
  return (
    <div className="mt-8 w-full">
      <a 
        href="https://www.amazon.de/gp/video/primesignup?tag=moovala0d-21" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="bg-[#0F1117] text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img 
              src="/lovable-uploads/8fa1b7d2-1b8a-45a0-945d-86314359e0ed.png" 
              alt="Prime Video" 
              className="h-8 w-auto"
            />
            <div className="text-left">
              <p className="text-lg font-medium mb-1">Streame ähnliche Filme kostenlos auf Prime Video</p>
              <p className="text-sm text-gray-400">30 Tage kostenlos - Danach 9,99€ / Monat</p>
            </div>
          </div>
          <Button 
            className="bg-[#FFB224] hover:bg-[#FFB224]/90 text-black min-w-[200px]"
          >
            <Play className="w-4 h-4 mr-2" />
            Gratis streamen
          </Button>
        </div>
      </a>
    </div>
  );
};

export default PrimeVideoAd;
