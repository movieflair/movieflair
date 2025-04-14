
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import { Zap, ChevronLeft, ChevronRight, Sparkles, Play } from 'lucide-react';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SimilarMoviesProps {
  movies: MovieOrShow[];
}

const SimilarMovies = ({ movies }: SimilarMoviesProps) => {
  const [randomMovie, setRandomMovie] = useState<MovieOrShow | null>(null);

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
              Ähnliche Filme
            </Link>
            <p className="text-gray-600">
              Entdecke weitere Filme, die dir gefallen könnten. Basierend auf deinem aktuellen Film haben wir eine Auswahl an ähnlichen Titeln zusammengestellt.
            </p>
            <div className="flex gap-2 mb-2 relative">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handlePrevClick}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handleNextClick}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute left-0 bottom-[-120px]">
                <Popover>
                  <PopoverTrigger asChild onClick={getRandomMovie}>
                    <Button 
                      variant="outline" 
                      className="w-fit bg-[#ea384c] text-white hover:bg-[#ea384c]/90 border-0"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Quick Tipp
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    {randomMovie && (
                      <div className="space-y-4">
                        <div className="aspect-[2/3] w-full rounded-lg overflow-hidden">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`}
                            alt={randomMovie.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{randomMovie.title}</h3>
                          {year && <p className="text-sm text-gray-500">{year}</p>}
                          <p className="text-sm text-gray-600 line-clamp-3">{randomMovie.overview}</p>
                          <Link to={`/movie/${randomMovie.id}`}>
                            <Button className="w-full bg-[#ea384c] text-white hover:bg-[#ea384c]/90">
                              <Play className="w-4 h-4 mr-2" />
                              Film ansehen
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovies;
