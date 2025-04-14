
import { X } from 'lucide-react';

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag = ({ label, onRemove }: FilterTagProps) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="ml-2 text-primary/70 hover:text-primary transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FilterTag;
