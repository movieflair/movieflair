
import React from 'react';
import { Button } from '@/components/ui/button';

interface MoodSelectorProps {
  moods: string[];
  selectedMoods: string[];
  onMoodSelect: (mood: string) => void;
}

const MoodSelector = ({ moods, selectedMoods, onMoodSelect }: MoodSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-theme-black">Welche Stimmung suchst du?</label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant="default"
            className={`
              ${selectedMoods.includes(mood) 
                ? 'bg-[#ff3131] hover:bg-[#ff3131]/90 text-white' 
                : 'hover:bg-gray-100 text-theme-black border border-gray-200 bg-white'}
              transition-all font-medium text-xs md:text-sm py-1.5 md:py-2.5 px-2 md:px-5
            `}
            onClick={() => onMoodSelect(mood)}
          >
            {mood}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
