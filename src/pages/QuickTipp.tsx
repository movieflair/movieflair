import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { Button } from '@/components/ui/button';
import { getRandomMovie, MovieDetail } from '@/lib/api';
import { Sparkles, Film, Clock, Calendar, Star, ArrowRight, Wand2, Target, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MovieRatingFeedback from '@/components/movies/MovieRatingFeedback';

const QuickTipp = () => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-700">
            Quick Tipp
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Entdecke neue Filme und Serien mit nur einem Klick. Unser intelligenter Algorithmus 
            wählt zufällig eine passende Empfehlung für dich aus.
          </p>
        </div>

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

        {movie && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 min-h-[250px]">
                  {movie.poster_path ? (
                    <div className="md:w-1/4">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-full h-[250px] object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[250px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <Film className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  <div className="md:w-3/4 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-2">
                        {movie.title || movie.name}
                      </h2>

                      <div className="flex items-center gap-4 mb-4">
                        {movie.release_date && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                          </div>
                        )}
                        {movie.runtime && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{movie.runtime} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{movie.vote_average.toFixed(1)}/10</span>
                        </div>
                      </div>

                      {movie.genres && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {movie.genres.map((genre) => (
                            <span 
                              key={genre.id}
                              className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {movie.overview || 'Keine Beschreibung verfügbar.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link 
                        to={`/movie/${movie.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Details ansehen
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <div className="text-xs text-gray-600">
                        <MovieRatingFeedback movieId={movie.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">Warum Quick Tipp?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mit Quick Tipp findest du in Sekunden deinen nächsten Lieblingsfilm. 
              Keine endlose Suche mehr - lass dich von unseren Vorschlägen überraschen!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Magische Empfehlungen</h3>
                <p className="text-gray-600 text-sm">
                  Unser Algorithmus zaubert dir perfekt passende Film- und Serienvorschläge.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Treffsicher & Schnell</h3>
                <p className="text-gray-600 text-sm">
                  Keine lange Suche mehr - finde sofort neue Unterhaltung mit einem Klick.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Entdecke Neues</h3>
                <p className="text-gray-600 text-sm">
                  Lass dich von überraschenden Vorschlägen inspirieren und entdecke verborgene Perlen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  );
};

export default QuickTipp;
