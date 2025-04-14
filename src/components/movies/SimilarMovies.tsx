
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import { Zap, ChevronLeft, ChevronRight, Sparkles, Play, X } from 'lucide-react';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface SimilarMoviesProps {
  movies: MovieOrShow[];
}

const SimilarMovies = ({ movies }: SimilarMoviesProps) => {
  const [randomMovie, setRandomMovie] = useState<MovieOrShow | null>(null);
  const [showRandomMovie, setShowRandomMovie] = useState(false);

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
  };

  const handleClose = () => {
    setShowRandomMovie(false);
  };

  const year = randomMovie?.release_date 
    ? new Date(randomMovie.release_date).getFullYear() 
    : undefined;

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
              {showRandomMovie ? randomMovie?.title : "Ähnliche Filme"}
            </Link>
            <p className="text-gray-600">
              {showRandomMovie 
                ? randomMovie?.overview 
                : "Entdecke weitere Filme, die dir gefallen könnten. Basierend auf deinem aktuellen Film haben wir eine Auswahl an ähnlichen Titeln zusammengestellt."}
            </p>
            <div className="flex gap-2 mb-2 relative">
              {!showRandomMovie && (
                <>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handlePrevClick}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handleNextClick}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute left-0 bottom-[-120px]">
                    <Button 
                      variant="outline" 
                      className="w-fit bg-[#ea384c] text-white hover:bg-[#ea384c]/90 border-0"
                      onClick={getRandomMovie}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Quick Tipp
                    </Button>
                  </div>
                </>
              )}
              {showRandomMovie && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="absolute right-0 top-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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
              <div className="w-[450px]">
                <MovieCard movie={randomMovie!} size="small" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovies;

