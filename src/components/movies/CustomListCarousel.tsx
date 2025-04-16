
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
import { CustomList, MovieOrShow } from '@/lib/api';
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
    <div className="container-custom my-3 md:my-12 px-0 md:px-8">
      <div className="glass-card overflow-hidden rounded-xl p-3 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3 md:gap-8">
          <div className="space-y-2 md:space-y-4">
            <Link 
              to="/discover" 
              className="flex items-center gap-1 md:gap-2 text-lg md:text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
            >
              <ListPlus className="w-4 h-4 md:w-6 md:h-6" />
              {list.title}
            </Link>
            <p className="text-xs md:text-base text-gray-600">
              {list.description}
            </p>
            <div className="flex items-center gap-2 mt-1 md:mt-2">
              <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0" onClick={handlePrevClick}>
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0" onClick={handleNextClick}>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          <div className="relative w-full md:w-[450px] mt-2 md:mt-0">
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
                  <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/2">
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

export default CustomListCarousel;
