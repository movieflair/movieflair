
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Video, PlayCircle } from 'lucide-react';

interface MovieCategoriesProps {
  isNewTrailer: boolean;
  isFreeMovie: boolean;
  onTrailerChange: (checked: boolean) => void;
  onFreeMovieChange: (checked: boolean) => void;
}

const MovieCategories = ({ 
  isNewTrailer, 
  isFreeMovie, 
  onTrailerChange, 
  onFreeMovieChange 
}: MovieCategoriesProps) => {
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-2">Kategorien</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isNewTrailer" 
            checked={isNewTrailer}
            onCheckedChange={onTrailerChange}
          />
          <Label htmlFor="isNewTrailer" className="flex items-center gap-1">
            <Video className="w-4 h-4" /> 
            Neuer Trailer
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isFreeMovie" 
            checked={isFreeMovie}
            onCheckedChange={onFreeMovieChange}
          />
          <Label htmlFor="isFreeMovie" className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" /> 
            Kostenlos
          </Label>
        </div>
      </div>
    </div>
  );
};

export default MovieCategories;
