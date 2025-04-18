
import React from 'react';

interface ImageSkeletonProps {
  className?: string;
  alt: string;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ className = '', alt }) => {
  return (
    <div 
      className={`animate-pulse rounded-md bg-gray-200 ${className || 'w-full h-full'}`}
      aria-label={alt}
      role="img"
    />
  );
};
