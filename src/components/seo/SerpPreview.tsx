
import React from 'react';

interface SerpPreviewProps {
  title: string;
  description: string;
  url: string;
}

const SerpPreview = ({ title, description, url }: SerpPreviewProps) => {
  // Truncate title and description to typical Google display limits
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const displayDescription = description.length > 155 ? description.substring(0, 152) + '...' : description;
  
  return (
    <div className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white max-w-[600px]">
      <div className="space-y-1">
        <div className="text-sm text-green-800 truncate">{url}</div>
        <h3 className="text-xl text-blue-700 font-medium leading-tight hover:underline cursor-pointer">
          {displayTitle || "Title Example - Your Brand Here"}
        </h3>
        <p className="text-sm text-gray-600 leading-snug">
          {displayDescription || "This is an example meta description that would appear in search results. Write compelling copy to improve click-through rates."}
        </p>
        <div className="pt-1 flex flex-wrap gap-2">
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">May 16, 2024</span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Sitelinks</span>
        </div>
      </div>
    </div>
  );
};

export default SerpPreview;
