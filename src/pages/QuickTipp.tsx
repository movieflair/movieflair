
import React, { useState } from 'react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { Button } from '@/components/ui/button';
import { getRandomMovie, MovieOrShow } from '@/lib/api';
import { Sparkles, Film, Clock, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="container-custom min-h-screen py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-700">
            Quick Tipp
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Entdecke neue Filme und Serien mit nur einem Klick. Unser intelligenter Algorithmus 
            wählt zufällig eine passende Empfehlung für dich aus.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-12">
          <Button 
            onClick={handleGetRandomMovie} 
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="mr-2 h-6 w-6" />
            {loading ? 'Suche einen tollen Film...' : 'Zufälligen Film vorschlagen'}
          </Button>
        </div>

        {/* Movie Recommendation Card */}
        {movie && (
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Movie Poster */}
                  <div className="md:w-1/3 relative">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-full h-[500px] object-cover"
                      />
                    ) : (
                      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                        <Film className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Movie Details */}
                  <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold mb-4">
                      {movie.title || movie.name}
                    </h2>

                    <div className="flex items-center gap-6 mb-6">
                      {movie.release_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-5 h-5" />
                          <span>{new Date(movie.release_date).getFullYear()}</span>
                        </div>
                      )}
                      {movie.runtime && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span>{movie.runtime} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>{movie.vote_average.toFixed(1)}/10</span>
                      </div>
                    </div>

                    {movie.genres && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {movie.genres.map((genre) => (
                          <span 
                            key={genre.id}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-gray-600 mb-8 line-clamp-4">
                      {movie.overview || 'Keine Beschreibung verfügbar.'}
                    </p>

                    {/* Rating Feedback */}
                    {movie.id && (
                      <div className="mt-auto pt-4 border-t">
                        <MovieRatingFeedback movieId={movie.id} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
};

export default QuickTipp;
