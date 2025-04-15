
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
      <label className="block text-sm font-medium text-gray-200 mb-3">Was möchtest du sehen?</label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as 'movie' | 'tv' | 'all')}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="movie" id="movie" className="border-[#ea384c] text-[#ea384c]" />
          <Label htmlFor="movie" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
            <Film className="h-4 w-4" />
            Filme
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="tv" id="tv" className="border-[#ea384c] text-[#ea384c]" />
          <Label htmlFor="tv" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
            <Tv className="h-4 w-4" />
            Serien
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" className="border-[#ea384c] text-[#ea384c]" />
          <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
            <MonitorPlay className="h-4 w-4" />
            Beides
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default MediaTypeSelector;
