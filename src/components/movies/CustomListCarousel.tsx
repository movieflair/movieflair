
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

interface CustomListCarouselProps {
  list: CustomList;
}

const CustomListCarousel = ({ list }: CustomListCarouselProps) => {
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
    <div className="container-custom my-12">
      <div className="glass-card overflow-hidden rounded-xl p-8">
        <div className="grid grid-cols-[1fr,auto] gap-8">
          <div className="space-y-4">
            <Link 
              to="/discover" 
              className="flex items-center gap-2 text-2xl font-semibold hover:text-[rgba(26,152,255,255)] transition-colors"
            >
              <ListPlus className="w-6 h-6" />
              {list.title}
            </Link>
            <p className="text-gray-600">
              {list.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handlePrevClick}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0" onClick={handleNextClick}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Carousel
              id={`list-${list.id}`}
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                skipSnaps: true,
              }}
              className="w-[450px]"
            >
              <CarouselContent className="-ml-4">
                {list.movies.map((movie) => (
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

export default CustomListCarousel;
