
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
            id="isTrailer" 
            checked={isNewTrailer}
            onCheckedChange={(checked) => onTrailerChange(checked as boolean)}
          />
          <Label htmlFor="isTrailer" className="flex items-center gap-1">
            <Video className="w-4 h-4" /> 
            Trailer
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isStream" 
            checked={isFreeMovie}
            onCheckedChange={(checked) => onFreeMovieChange(checked as boolean)}
          />
          <Label htmlFor="isStream" className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" /> 
            Stream
          </Label>
        </div>
      </div>
    </div>
  );
};

export default MovieCategories;
