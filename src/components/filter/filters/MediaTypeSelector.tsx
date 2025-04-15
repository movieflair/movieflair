
import React from 'react';
import { Film } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MediaTypeSelectorProps {
  value: 'movie';
  onChange: (value: 'movie') => void;
}

const MediaTypeSelector = ({ value, onChange }: MediaTypeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-theme-black mb-3">Was möchtest du sehen?</label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as 'movie')}
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
      </RadioGroup>
    </div>
  );
};

export default MediaTypeSelector;
