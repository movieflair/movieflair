
import { X } from 'lucide-react';

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag = ({ label, onRemove }: FilterTagProps) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#ea384c]/10 text-[#ea384c] text-sm">
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="ml-2 text-[#ea384c]/70 hover:text-[#ea384c] transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FilterTag;
