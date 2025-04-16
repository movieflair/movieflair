
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
import { CustomList } from '@/lib/api';
import MovieCard from './MovieCard';
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from 'react';

interface CustomListCarouselProps {
  list: CustomList;
}

const CustomListCarousel = ({ list }: CustomListCarouselProps) => {
  if (!list.movies.length) return null;
  
  // Create a ref for the carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle manual navigation
  const handlePrevious = () => {
    const prevButton = carouselRef.current?.querySelector('[data-carousel-prev]') as HTMLButtonElement;
    if (prevButton) prevButton.click();
  };

  const handleNext = () => {
    const nextButton = carouselRef.current?.querySelector('[data-carousel-next]') as HTMLButtonElement;
    if (nextButton) nextButton.click();
  };

  return (
    <div className="w-full max-w-[800px] mx-auto mb-8">
      <div className="bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-row gap-4">
          {/* Text section */}
          <div className="w-[200px] space-y-4">
            <div className="space-y-1">
              <Link 
                to="/discover" 
                className="flex items-center gap-2 text-lg font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
              >
                <ListPlus className="w-4 h-4" />
                {list.title}
              </Link>
              <p className="text-sm text-gray-600 line-clamp-2">
                {list.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full bg-white/90 backdrop-blur p-0 hover:bg-white/95"
                onClick={handlePrevious}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full bg-white/90 backdrop-blur p-0 hover:bg-white/95"
                onClick={handleNext}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Movie covers section */}
          <div className="flex-1 pl-16 pr-16">
            <Carousel
              ref={carouselRef}
              id={`carousel-${list.id}`}
              className="w-full"
              opts={{
                align: "end",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {list.movies.map((movie) => (
                  <CarouselItem key={movie.id} className="pl-1 md:pl-1 basis-1/3">
                    <div className="w-full transition-transform duration-300 hover:scale-105 cursor-pointer">
                      <MovieCard movie={movie} size="small" hideDetails />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden" data-carousel-prev />
              <CarouselNext className="hidden" data-carousel-next />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomListCarousel;
