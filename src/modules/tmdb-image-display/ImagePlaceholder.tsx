
import React from 'react';

interface ImagePlaceholderProps {
  className?: string;
  alt: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ className = '', alt }) => {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className || 'w-full h-full'}`} aria-label={alt}>
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-gray-400"
      >
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M20.4 14.5L16 10 4 20" />
      </svg>
    </div>
  );
};
