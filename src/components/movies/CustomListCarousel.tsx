
import { Link } from 'react-router-dom';
import { ListPlus } from 'lucide-react';
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

interface CustomListCarouselProps {
  list: CustomList;
}

const CustomListCarousel = ({ list }: CustomListCarouselProps) => {
  if (!list.movies.length) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-row gap-4">
          {/* Text section - 1/3 width */}
          <div className="w-1/3 space-y-4">
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
                onClick={() => {
                  const prevButton = document.querySelector(`#carousel-${list.id} [data-carousel-prev]`) as HTMLButtonElement;
                  if (prevButton) prevButton.click();
                }}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full bg-white/90 backdrop-blur p-0 hover:bg-white/95"
                onClick={() => {
                  const nextButton = document.querySelector(`#carousel-${list.id} [data-carousel-next]`) as HTMLButtonElement;
                  if (nextButton) nextButton.click();
                }}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Movie covers section - 2/3 width */}
          <div className="w-2/3">
            <Carousel
              id={`carousel-${list.id}`}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {list.movies.map((movie) => (
                  <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/3">
                    <div className="w-full transition-transform duration-300 hover:scale-105 cursor-pointer">
                      <MovieCard movie={movie} size="small" hideDetails />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden" />
              <CarouselNext className="hidden" />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomListCarousel;
