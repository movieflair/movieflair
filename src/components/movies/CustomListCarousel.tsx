
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
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

  return (
    <div className="container-custom my-3 md:my-6">
      <div className="glass-card overflow-hidden rounded-xl p-3 md:p-6">
        <div className="grid grid-cols-1 gap-3 md:gap-6">
          <div className="space-y-2">
            <Link 
              to="/discover" 
              className="flex items-center gap-1 md:gap-2 text-lg font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
            >
              <ListPlus className="w-4 h-4" />
              {list.title}
            </Link>
            <p className="text-xs text-gray-600 line-clamp-1">
              {list.description}
            </p>
          </div>

          <div className="relative w-full">
            <div className="flex justify-center items-center relative h-[200px]">
              {list.movies.slice(0, 3).map((movie, index) => (
                <div 
                  key={movie.id}
                  className="absolute w-[130px] transition-all duration-300 hover:z-20 hover:scale-105"
                  style={{
                    transform: `translateX(${(index - 1) * 30}px)`,
                    zIndex: index,
                  }}
                >
                  <MovieCard movie={movie} size="small" hideDetails />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 justify-center">
              <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0" onClick={handlePrevClick}>
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0" onClick={handleNextClick}>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomListCarousel;
