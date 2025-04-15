
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Gift, Compass, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SheetContent, SheetClose } from "@/components/ui/sheet";

interface MobileNavigationProps {
  onNavigate: (path: string) => void;
}

const MobileNavigation = ({ onNavigate }: MobileNavigationProps) => {
  return (
    <SheetContent side="right" className="bg-theme-black text-white border-theme-black w-[280px] p-0">
      <div className="flex flex-col h-full py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center" onClick={() => onNavigate('/')}>
            <img 
              src="/lovable-uploads/26151e5a-66d8-4a56-ad10-e034335711e1.png" 
              alt="MovieFlair Logo" 
              className="h-8 w-auto mr-2" 
            />
          </Link>
          <SheetClose className="rounded-sm opacity-70 text-white transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="py-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
              onClick={() => onNavigate('/entdecken')}
            >
              <Compass className="mr-2 h-5 w-5" />
              <span>Entdecken</span>
            </Button>
          </div>
          
          <div className="py-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
              onClick={() => onNavigate('/neue-trailer')}
            >
              <Play className="mr-2 h-5 w-5" />
              <span>Neue Trailer</span>
            </Button>
          </div>
          
          <div className="py-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
              onClick={() => onNavigate('/kostenlose-filme')}
            >
              <Gift className="mr-2 h-5 w-5" />
              <span>Kostenlos</span>
            </Button>
          </div>
          
          <div className="py-2">
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={() => onNavigate('/quick-tipp')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              <span>Quick Tipp</span>
            </Button>
          </div>
        </div>
      </div>
    </SheetContent>
  );
};

export default MobileNavigation;
