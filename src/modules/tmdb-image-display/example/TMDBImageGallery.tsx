
import React, { useState, useEffect } from 'react';
import { TMDBImageDisplay, tmdbImageService } from '../index';

interface TMDBImageGalleryProps {
  apiKey: string;
  movieId?: string;
  showId?: string;
}

export const TMDBImageGallery: React.FC<TMDBImageGalleryProps> = ({ apiKey, movieId, showId }) => {
  const [images, setImages] = useState<{path: string, type: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the service
    tmdbImageService.initialize(apiKey);

    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      try {
        let endpoint = '';
        if (movieId) {
          endpoint = `/movie/${movieId}/images`;
        } else if (showId) {
          endpoint = `/tv/${showId}/images`;
        } else {
          throw new Error('Either movieId or showId must be provided');
        }

        const response = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}`);
        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Combine posters and backdrops
        const combinedImages = [
          ...data.posters.slice(0, 5).map((img: any) => ({ path: img.file_path, type: 'poster' })),
          ...data.backdrops.slice(0, 5).map((img: any) => ({ path: img.file_path, type: 'backdrop' }))
        ];
        
        setImages(combinedImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    if (apiKey && (movieId || showId)) {
      fetchImages();
    }
  }, [apiKey, movieId, showId]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Loading images...</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Error loading images</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">No images available</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Image Gallery</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className={image.type === 'backdrop' ? 'aspect-video' : 'aspect-[2/3]'}>
            <TMDBImageDisplay
              path={image.path}
              size={image.type === 'backdrop' ? 'w780' : 'w500'}
              type={image.type as 'poster' | 'backdrop'}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg shadow-md"
              priority={index < 3} // Prioritize first 3 images
            />
          </div>
        ))}
      </div>
    </div>
  );
};
