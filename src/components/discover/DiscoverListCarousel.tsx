import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
import { CustomList } from '@/lib/api';
import MovieCard from '../movies/MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

interface DiscoverListCarouselProps {
  list: CustomList;
}

const DiscoverListCarousel = ({ list }: DiscoverListCarouselProps) => {
  const isMobile = useIsMobile();
  
  if (!list.movies.length) return null;

  const handlePrevClick = () => {
    const prevButton = document.querySelector(`#discover-list-${list.id} .embla__prev`) as HTMLElement;
    if (prevButton) prevButton.click();
  };

  const handleNextClick = () => {
    const nextButton = document.querySelector(`#discover-list-${list.id} .embla__next`) as HTMLElement;
    if (nextButton) nextButton.click();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListPlus className="w-4 h-4 md:w-6 md:h-6" />
          <Link 
            to="/discover" 
            className="text-lg md:text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
          >
            {list.title}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0" onClick={handlePrevClick}>
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0" onClick={handleNextClick}>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {list.description && (
        <p className="text-xs md:text-sm text-gray-600 mb-4">
          {list.description}
        </p>
      )}

      <div className="relative">
        <Carousel
          id={`discover-list-${list.id}`}
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            skipSnaps: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {list.movies.map((movie) => (
              <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4">
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
  );
};

export default DiscoverListCarousel;
