
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import FilterTag from './FilterTag';
import { moodToGenres } from '@/lib/api';
import { Genre } from '@/lib/api';

interface FilterSelectorProps {
  title: string;
  options: string[] | Genre[];
  onSelect: (value: string | number) => void;
  selectedValues: (string | number)[];
  type: 'mood' | 'genre' | 'decade';
  maxSelections?: number;
}

const FilterSelector = ({ 
  title, 
  options, 
  onSelect, 
  selectedValues, 
  type,
  maxSelections = 3
}: FilterSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string | number) => {
    if (selectedValues.length < maxSelections || selectedValues.includes(value)) {
      onSelect(value);
      setIsOpen(false);
    }
  };

  const getLabel = (value: string | number): string => {
    if (type === 'genre') {
      const genre = (options as Genre[]).find(g => g.id === value);
      return genre ? genre.name : '';
    }
    return value.toString();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-border rounded-lg bg-background"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map((value) => (
            <FilterTag 
              key={value.toString()} 
              label={getLabel(value)}
              onRemove={() => onSelect(value)}
            />
          ))}
        </div>
      )}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-2">
            {options.map((option) => {
              const value = type === 'genre' ? (option as Genre).id : option;
              const label = type === 'genre' ? (option as Genre).name : option.toString();
              const isSelected = selectedValues.includes(value);
              
              return (
                <button
                  key={value.toString()}
                  onClick={() => handleSelect(value)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors ${
                    isSelected ? 'bg-red-500/10 text-red-500' : ''
                  }`}
                  disabled={selectedValues.length >= maxSelections && !isSelected}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSelector;
