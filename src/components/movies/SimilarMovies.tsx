import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import { ChevronLeft, ChevronRight, Zap, X, FileText, Play } from 'lucide-react';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface SimilarMoviesProps {
  movies: MovieOrShow[];
}

const SimilarMovies = ({ movies }: SimilarMoviesProps) => {
  const [randomMovie, setRandomMovie] = useState<MovieOrShow | null>(null);
  const [showRandomMovie, setShowRandomMovie] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movies.length) return null;

  const handlePrevClick = () => {
    const prevButton = document.querySelector('.embla__prev') as HTMLElement;
    if (prevButton) prevButton.click();
  };

  const handleNextClick = () => {
    const nextButton = document.querySelector('.embla__next') as HTMLElement;
    if (nextButton) nextButton.click();
  };

  const getRandomMovie = () => {
    const randomIndex = Math.floor(Math.random() * movies.length);
    setRandomMovie(movies[randomIndex]);
    setShowRandomMovie(true);
    toast({
      title: "Quick Tipp",
      description: `Wir haben "${movies[randomIndex].title}" für dich ausgewählt!`,
    });
  };

  const handleClose = () => {
    setShowRandomMovie(false);
  };

  const year = randomMovie?.release_date 
    ? new Date(randomMovie.release_date).getFullYear() 
    : undefined;

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="container-custom mt-16">
      <div className="glass-card overflow-hidden rounded-xl p-8">
        <div className="grid grid-cols-[1fr,auto] gap-8">
          <div className="space-y-4">
            <Link 
              to="/discover" 
              className="flex items-center gap-2 text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
            >
              <Zap className="w-6 h-6" />
              {showRandomMovie ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>{randomMovie?.title}</span>
                  </div>
                  {year && <span className="text-sm text-gray-500">{year}</span>}
                </div>
              ) : (
                "Ähnliche Filme"
              )}
            </Link>
            <p className="text-gray-600">
              {showRandomMovie 
                ? randomMovie?.overview 
                : "Entdecke weitere Filme, die dir gefallen könnten. Basierend auf deinem aktuellen Film haben wir eine Auswahl an ähnlichen Titeln zusammengestellt."}
            </p>
            {!showRandomMovie && (
              <div className="absolute bottom-32 left-8">
                <Button 
                  variant="outline" 
                  className="w-fit bg-[#ea384c] text-white hover:bg-[#ea384c]/90 border-0 shadow-lg"
                  onClick={getRandomMovie}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Tipp
                </Button>
              </div>
            )}
            {!showRandomMovie && (
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handlePrevClick}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handleNextClick}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {showRandomMovie && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-auto"
                  asChild
                >
                  <Link to={`/movie/${randomMovie!.id}`} className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Details
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-auto"
                  onClick={() => setShowTrailer(true)}
                >
                  <Play className="w-4 h-4" />
                  Trailer
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            {!showRandomMovie ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: true,
                  skipSnaps: true,
                }}
                className="w-[450px]"
              >
                <CarouselContent className="-ml-4">
                  {movies.map((movie) => (
                    <CarouselItem key={movie.id} className="pl-4 basis-1/2">
                      <MovieCard movie={movie} size="small" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                <div className="hidden">
                  <CarouselPrevious className="embla__prev" />
                  <CarouselNext className="embla__next" />
                </div>
              </Carousel>
            ) : (
              <div className="relative w-[450px]">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="absolute -top-10 right-0 h-8 w-8"
                >
                  <X className="h-6 w-6 text-[#ea384c]" />
                </Button>
                <div className="relative">
                  {randomMovie?.backdrop_path && (
                    <div 
                      className="absolute inset-0 right-[-100px] opacity-20"
                      style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500${randomMovie.backdrop_path})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center right',
                        backgroundRepeat: 'no-repeat',
                        height: '300px',
                      }}
                    />
                  )}
                  <div className="relative">
                    <MovieCard 
                      movie={randomMovie!} 
                      size="small" 
                      hideDetails={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovies;
