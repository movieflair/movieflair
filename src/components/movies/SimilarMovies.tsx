
import React from 'react';
import { Link } from 'react-router-dom';
import { MovieOrShow } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SimilarMoviesProps {
  movies: MovieOrShow[];
}

const SimilarMovies = ({ movies }: SimilarMoviesProps) => {
  if (!movies.length) return null;

  return (
    <div className="mt-16">
      <div className="grid grid-cols-[400px,1fr] gap-8">
        <div className="space-y-4">
          <Link 
            to="/discover" 
            className="text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
          >
            Ähnliche Filme
          </Link>
          <p className="text-gray-600">
            Entdecke weitere Filme, die dir gefallen könnten. Basierend auf deinem aktuellen Film haben wir eine Auswahl an ähnlichen Titeln zusammengestellt.
          </p>
        </div>

        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {movies.map((movie) => (
                <CarouselItem key={movie.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <MovieCard movie={movie} size="small" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-12 bg-white hover:bg-gray-100" />
            <CarouselNext className="absolute -right-12 bg-white hover:bg-gray-100" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default SimilarMovies;
