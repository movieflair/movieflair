
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import FilterTag from './FilterTag';
import { decadeRanges } from './data/filterOptions';
import { Genre } from '@/lib/types';

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
    } else if (type === 'decade' && typeof value === 'string') {
      return decadeRanges[value] || value.toString();
    }
    return value.toString();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
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
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-2">
            {options.map((option) => {
              const value = type === 'genre' ? (option as Genre).id : option;
              let label = type === 'genre' ? (option as Genre).name : option.toString();
              
              // Bei Jahrzehnten verwenden wir die benutzerfreundliche Anzeige
              if (type === 'decade' && typeof value === 'string') {
                label = decadeRanges[value] || value;
              }
              
              const isSelected = selectedValues.includes(value);
              
              return (
                <button
                  key={value.toString()}
                  onClick={() => handleSelect(value)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    isSelected ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'
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
