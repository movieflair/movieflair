
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListPlus, ArrowUpRight } from 'lucide-react';
import { CustomList } from '@/lib/api';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { createUrlSlug } from '@/lib/urlUtils';

interface CustomListCarouselProps {
  list: CustomList;
}

const CustomListCarousel = ({ list }: CustomListCarouselProps) => {
  const isMobile = useIsMobile();
  
  if (!list.movies.length) return null;

  const handlePrevClick = () => {
    const prevButton = document.querySelector(`#list-${list.id} .embla__prev`) as HTMLElement;
    if (prevButton) prevButton.click();
  };

  const handleNextClick = () => {
    const nextButton = document.querySelector(`#list-${list.id} .embla__next`) as HTMLElement;
    if (nextButton) nextButton.click();
  };

  const handleListClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl shadow-lg border border-gray-100 max-w-[800px] mx-auto relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListPlus className="w-4 h-4 md:w-6 md:h-6" />
          <Link 
            to={`/liste/${createUrlSlug(list.title)}`}
            className="text-lg md:text-2xl font-semibold hover:text-gray-800 transition-colors"
            onClick={handleListClick}
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
          id={`list-${list.id}`}
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

      <Link 
        to={`/liste/${createUrlSlug(list.title)}`}
        className="absolute bottom-2 right-2 text-xs text-gray-400 hover:text-gray-800 transition-colors duration-300 flex items-center gap-1 opacity-50 hover:opacity-100"
        onClick={handleListClick}
      >
        <span>Liste ansehen</span>
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default CustomListCarousel;
