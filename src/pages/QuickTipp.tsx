
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { Button } from '@/components/ui/button';
import { getRandomMovie, MovieDetail } from '@/lib/api';
import { Sparkles, ArrowRight, Wand2, Target, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MovieRatingFeedback from '@/components/movies/MovieRatingFeedback';
import { toast } from 'sonner';
import { scrollToTop } from '@/utils/scrollUtils';

const QuickTipp = () => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetRandomMovie = async () => {
    setLoading(true);
    try {
      const randomMovie = await getRandomMovie();
      if (!randomMovie.poster_path || !randomMovie.overview || randomMovie.overview.trim() === '') {
        toast.error('Film ohne Beschreibung oder Cover gefunden. Bitte erneut versuchen.');
        setLoading(false);
        return;
      }
      setMovie(randomMovie);
    } catch (error) {
      console.error('Error getting random movie:', error);
      toast.error('Fehler beim Laden eines Films');
    } finally {
      setLoading(false);
    }
  };

  const truncateOverview = (text: string, maxLength: number = 400) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <EnhancedLayout>
      <div className="container-custom min-h-screen py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ff3131]">
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
            className="bg-gradient-to-r from-[#ff3131] to-[#ff3131] hover:from-[#ff3131]/90 hover:to-[#ff3131]/90 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="mr-2 h-6 w-6" />
            {loading ? 'Suche einen tollen Film...' : 'Zufälligen Film vorschlagen'}
          </Button>
        </div>

        {movie && (
          <div className="mt-8 animate-fade-in">
            <div className="rounded-xl p-6 shadow-lg border border-gray-100 relative overflow-hidden max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-lg font-medium text-gray-800">
                  Deine Filmempfehlung
                </h3>
                {/* Removed "Neuer Vorschlag" button */}
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                {movie.poster_path ? (
                  <Link 
                    to={`/film/${movie.id}`}
                    className="group block overflow-hidden rounded-xl w-full md:w-[200px]"
                    onClick={scrollToTop}
                  >
                    <div className="relative h-[300px] bg-muted overflow-hidden rounded-xl">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full md:w-[200px] h-[300px] bg-muted rounded-xl flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}

                <div className="flex-1 text-gray-900">
                  <h4 className="text-xl font-medium mb-2">
                    {movie.title || movie.name}
                  </h4>
                  <p className="text-sm mb-4">
                    {movie.release_date?.substring(0, 4) || ''}
                  </p>
                  <p className="text-sm mb-6">
                    {truncateOverview(movie.overview)}
                  </p>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => {
                        scrollToTop();
                        window.location.href = `/film/${movie.id}`;
                      }}
                      className="w-full md:w-auto bg-[#ff3131] hover:bg-[#ff3131]/90 text-white flex items-center"
                    >
                      Details ansehen
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    
                    {movie.id && (
                      <div className="text-xs text-gray-600">
                        <MovieRatingFeedback movieId={movie.id} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto mb-16 mt-16">
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
