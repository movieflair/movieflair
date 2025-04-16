
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ListPlus, ArrowUpRight } from 'lucide-react';
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
import { createUrlSlug } from '@/lib/urlUtils';

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
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-3 md:p-6 rounded-2xl shadow-lg border border-slate-100 max-w-4xl mx-auto relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListPlus className="w-4 h-4 md:w-6 md:h-6 text-black" />
          <Link 
            to={`/liste/${list.id}/${createUrlSlug(list.title)}`} 
            className="text-lg md:text-2xl font-semibold hover:text-gray-800 transition-colors"
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
      
      <Link 
        to={`/liste/${list.id}/${createUrlSlug(list.title)}`}
        className="absolute bottom-2 right-2 text-xs text-gray-400 hover:text-gray-800 transition-colors duration-300 flex items-center gap-1 opacity-50 hover:opacity-100"
      >
        <span>Liste ansehen</span>
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
};

export default DiscoverListCarousel;
