
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, ArrowLeft, Play, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getPopularMovies } from '@/lib/api';
import type { MovieOrShow } from '@/lib/api';

const QuickTipp = () => {
  const [movies, setMovies] = useState<MovieOrShow[]>([]);
  const [randomMovie, setRandomMovie] = useState<MovieOrShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast({
          title: "Fehler",
          description: "Beim Laden der Filme ist ein Fehler aufgetreten.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const getRandomMovie = () => {
    if (movies.length === 0) return;
    
    setShowAnimation(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * movies.length);
      const selectedMovie = movies[randomIndex];
      
      setRandomMovie(selectedMovie);
      setShowAnimation(false);
      
      toast({
        title: "Quick Tipp",
        description: `Wir haben "${selectedMovie.title}" für dich ausgewählt!`,
      });
    }, 1500);
  };

  const handleViewDetails = () => {
    if (randomMovie) {
      navigate(`/movie/${randomMovie.id}`);
    }
  };

  const handleGetNewTipp = () => {
    getRandomMovie();
  };

  const year = randomMovie?.release_date 
    ? new Date(randomMovie.release_date).getFullYear() 
    : undefined;

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="container-custom py-10">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-[#ea384c]" />
              Quick Tipp
            </h1>
          </div>
          
          <div className="glass-card rounded-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">Finde deinen nächsten Lieblingsfilm</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nicht sicher, was du als nächstes schauen sollst? Unser Quick Tipp Feature wählt zufällig einen Film aus unserer Sammlung beliebter Titel aus. Klicke einfach auf den Button unten und lass dich überraschen!
              </p>
            </div>
            
            {!randomMovie && !showAnimation && (
              <div className="flex justify-center my-10">
                <Button 
                  className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white text-lg px-8 py-6 rounded-lg shadow-lg transform transition-transform hover:scale-105"
                  onClick={getRandomMovie}
                  disabled={loading}
                >
                  <Zap className="w-6 h-6 mr-2" />
                  {loading ? "Filme werden geladen..." : "Zeige mir einen Quick Tipp!"}
                </Button>
              </div>
            )}
            
            {showAnimation && (
              <div className="flex flex-col items-center justify-center my-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#ea384c] mb-4"></div>
                <p className="text-gray-600">Suche einen Film für dich...</p>
              </div>
            )}
            
            {randomMovie && !showAnimation && (
              <div className="grid md:grid-cols-[300px,1fr] gap-8 mt-8">
                <div className="relative">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    {randomMovie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`}
                        alt={randomMovie.title}
                        className="w-full"
                      />
                    ) : (
                      <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Kein Poster</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-gray-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#ea384c]" />
                    <h3 className="text-3xl font-semibold">{randomMovie.title}</h3>
                  </div>
                  
                  {year && (
                    <p className="text-lg text-gray-500 mt-2">
                      {year}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-2 mb-4">
                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-md">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="font-medium">{randomMovie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {randomMovie.overview}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button 
                      className="bg-[#8E9196] hover:bg-[#8E9196]/90 text-white flex items-center gap-2"
                      onClick={handleViewDetails}
                    >
                      <FileText className="w-4 h-4" />
                      Mehr Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white flex items-center gap-2 border-0"
                      onClick={handleGetNewTipp}
                    >
                      <Sparkles className="w-4 h-4" />
                      Neuer Vorschlag
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-6">
                    <p className="text-gray-600">War dieser Vorschlag hilfreich?</p>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      Ja
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4" />
                      Nein
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-4">Warum Quick Tipp?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 flex items-center justify-center bg-[#ea384c]/10 rounded-full mb-4">
                  <Zap className="w-6 h-6 text-[#ea384c]" />
                </div>
                <h3 className="text-lg font-medium mb-2">Entdecke Neues</h3>
                <p className="text-gray-600">Finde Filme, die du vielleicht sonst übersehen hättest.</p>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 flex items-center justify-center bg-[#ea384c]/10 rounded-full mb-4">
                  <Play className="w-6 h-6 text-[#ea384c]" />
                </div>
                <h3 className="text-lg font-medium mb-2">Keine Langeweile</h3>
                <p className="text-gray-600">Schluss mit endlosem Scrollen durch Streaming-Dienste.</p>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 flex items-center justify-center bg-[#ea384c]/10 rounded-full mb-4">
                  <svg className="w-6 h-6 text-[#ea384c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Spare Zeit</h3>
                <p className="text-gray-600">Schnelle Entscheidung statt stundenlangem Suchen.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuickTipp;
