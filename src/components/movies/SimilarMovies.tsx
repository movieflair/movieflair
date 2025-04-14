
import React from 'react';
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
      <h2 className="text-2xl font-semibold mb-6">Ähnliche Filme</h2>
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
          <CarouselPrevious className="absolute -left-12" />
          <CarouselNext className="absolute -right-12" />
        </Carousel>
      </div>
    </div>
  );
};

export default SimilarMovies;
