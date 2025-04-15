
import React from 'react';
import { Film, Tv, MonitorPlay } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MediaTypeSelectorProps {
  value: string;
  onChange: (value: 'movie' | 'tv' | 'all') => void;
}

const MediaTypeSelector = ({ value, onChange }: MediaTypeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-theme-black mb-3">Was möchtest du sehen?</label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as 'movie' | 'tv' | 'all')}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem 
            value="movie" 
            id="movie" 
            className="border-theme-red text-theme-red" 
          />
          <Label 
            htmlFor="movie" 
            className="flex items-center gap-2 cursor-pointer text-theme-black hover:text-theme-black/80"
          >
            <Film className="h-4 w-4 text-theme-black" />
            Filme
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem 
            value="tv" 
            id="tv" 
            className="border-theme-red text-theme-red" 
          />
          <Label 
            htmlFor="tv" 
            className="flex items-center gap-2 cursor-pointer text-theme-black hover:text-theme-black/80"
          >
            <Tv className="h-4 w-4 text-theme-black" />
            Serien
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem 
            value="all" 
            id="all" 
            className="border-theme-red text-theme-red" 
          />
          <Label 
            htmlFor="all" 
            className="flex items-center gap-2 cursor-pointer text-theme-black hover:text-theme-black/80"
          >
            <MonitorPlay className="h-4 w-4 text-theme-black" />
            Beides
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default MediaTypeSelector;
