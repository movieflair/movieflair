
import React, { useState } from 'react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { Button } from '@/components/ui/button';
import { getRandomMovie, MovieOrShow } from '@/lib/api';
import { Sparkles } from 'lucide-react';
import RecommendationCard from '@/components/movies/RecommendationCard';
import MovieRatingFeedback from '@/components/movies/MovieRatingFeedback';

const QuickTipp = () => {
  const [movie, setMovie] = useState<MovieOrShow | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetRandomMovie = async () => {
    setLoading(true);
    try {
      const randomMovie = await getRandomMovie();
      setMovie(randomMovie);
    } catch (error) {
      console.error('Error getting random movie:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EnhancedLayout>
      <div className="container-custom pt-2 pb-6">
        <h1 className="text-3xl font-semibold mb-4">Quick Tipp</h1>
        <p className="text-gray-600 mb-6">
          Hier findest du zufällige Filmempfehlungen, wenn du dich nicht entscheiden kannst.
        </p>

        <div className="flex justify-center mb-8">
          <Button 
            onClick={handleGetRandomMovie} 
            disabled={loading}
            className="bg-[#ea384c] hover:bg-[#ea384c]/90"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {loading ? 'Lade Empfehlung...' : 'Zufälligen Film vorschlagen'}
          </Button>
        </div>

        {movie && (
          <div className="flex flex-col items-center">
            <div className="max-w-[300px] mb-6">
              <RecommendationCard movie={movie} />
            </div>
            
            {movie.id && <MovieRatingFeedback movieId={movie.id} />}
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
};

export default QuickTipp;
