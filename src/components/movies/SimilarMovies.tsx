
import React from 'react';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';
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
  if (!movies.length) return null;

  return (
    <div className="container-custom mt-16">
      <div className="glass-card overflow-hidden rounded-xl p-8">
        <div className="grid gap-8">
          <div className="space-y-4">
            <Link 
              to="/discover" 
              className="flex items-center gap-2 text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
            >
              <Film className="w-6 h-6" />
              Ähnliche Filme
            </Link>
            <p className="text-gray-600">
              Entdecke weitere Filme, die dir gefallen könnten. Basierend auf deinem aktuellen Film haben wir eine Auswahl an ähnlichen Titeln zusammengestellt.
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              skipSnaps: true,
            }}
            className="w-full"
          >
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={() => document.querySelector('.embla__prev')?.click()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={() => document.querySelector('.embla__next')?.click()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <CarouselContent className="-ml-6">
              {movies.map((movie) => (
                <CarouselItem key={movie.id} className="pl-6 basis-1/4 md:basis-1/4 lg:basis-1/5">
                  <MovieCard movie={movie} size="small" />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Hidden carousel controls that will be triggered by our custom buttons */}
            <div className="hidden">
              <CarouselPrevious className="embla__prev" />
              <CarouselNext className="embla__next" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovies;
