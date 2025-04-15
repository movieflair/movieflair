
import { X } from 'lucide-react';

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag = ({ label, onRemove }: FilterTagProps) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EE3B3B]/10 text-[#EE3B3B] text-sm">
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="ml-2 text-[#EE3B3B]/70 hover:text-[#EE3B3B] transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FilterTag;
