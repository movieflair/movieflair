
import React from 'react';
import { Star } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface RatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const RatingSelector = ({ value, onChange }: RatingSelectorProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-amber-500" />
        <label className="block text-sm font-medium text-gray-600">Mindestbewertung: {value}/10</label>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={10}
        step={1}
        onValueChange={(values) => onChange(values[0])}
        className="py-4 [&_[role=slider]]:bg-white [&_[role=slider]]:border-gray-300 [&_[role=slider]]:border-2 [&_[data-orientation=horizontal]>.slider-track]:bg-gray-200 [&_[data-orientation=horizontal]>.slider-range]:bg-gray-800"
      />
    </div>
  );
};

export default RatingSelector;
