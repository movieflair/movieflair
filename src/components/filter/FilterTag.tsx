
import { X } from 'lucide-react';

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag = ({ label, onRemove }: FilterTagProps) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FilterTag;
