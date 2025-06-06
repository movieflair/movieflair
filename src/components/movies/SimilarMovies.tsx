
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { scrollToTop } from '@/utils/scrollUtils';

interface SimilarMoviesProps {
  movies: MovieOrShow[];
}

const SimilarMovies = ({ movies }: SimilarMoviesProps) => {
  const [filteredMovies, setFilteredMovies] = useState<MovieOrShow[]>([]);
  
  useEffect(() => {
    const filtered = movies.filter(movie => 
      movie.poster_path && 
      movie.overview && 
      movie.overview.trim() !== ''
    );
    setFilteredMovies(filtered);
  }, [movies]);

  if (!filteredMovies.length) return null;

  const handlePrevClick = () => {
    const prevButton = document.querySelector('.embla__prev') as HTMLElement;
    if (prevButton) prevButton.click();
  };

  const handleNextClick = () => {
    const nextButton = document.querySelector('.embla__next') as HTMLElement;
    if (nextButton) nextButton.click();
  };

  return (
    <div className="container-custom mt-16">
      <div className="glass-card overflow-hidden rounded-xl p-8">
        <div className="grid grid-cols-[1fr,auto] gap-8">
          <div className="space-y-4 relative">
            <Link 
              to="/discover" 
              className="flex items-center gap-2 text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
            >
              <Zap className="w-6 h-6" />
              Ähnliche Filme
            </Link>
            <p className="text-gray-600">
              Entdecke weitere Filme, die dir gefallen könnten. Basierend auf deinem aktuellen Film haben wir eine Auswahl an ähnlichen Titeln zusammengestellt.
            </p>
            <div className="absolute bottom-24 left-0">
              <Button 
                variant="outline" 
                className="w-fit bg-[#ff3131] text-white hover:bg-[#ff3131]/90 border-0 shadow-lg"
                asChild
              >
                <Link to="/quick-tipp">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Tipp
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handlePrevClick}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handleNextClick}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
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
                {filteredMovies.map((movie) => (
                  <CarouselItem key={movie.id} className="pl-4 basis-1/2">
                    <div onClick={scrollToTop}>
                      <MovieCard movie={movie} size="large" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <div className="hidden">
                <CarouselPrevious className="embla__prev" />
                <CarouselNext className="embla__next" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovies;
