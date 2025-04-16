
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
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

interface CustomListCarouselProps {
  list: CustomList;
}

const CustomListCarousel = ({ list }: CustomListCarouselProps) => {
  if (!list.movies.length) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto mb-8">
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-[1fr,auto] gap-8">
          <div className="space-y-4">
            <Link 
              to="/discover" 
              className="flex items-center gap-2 text-2xl font-semibold hover:text-theme-accent-blue transition-colors"
            >
              <Zap className="w-6 h-6" />
              {list.title}
            </Link>
            <p className="text-gray-600 max-w-[350px]">
              {list.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <CarouselPrevious className="relative static translate-y-0 h-8 w-8 rounded-full bg-white/90 backdrop-blur hover:bg-white/95" />
              <CarouselNext className="relative static translate-y-0 h-8 w-8 rounded-full bg-white/90 backdrop-blur hover:bg-white/95" />
            </div>
          </div>

          <div className="relative">
            <Carousel
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
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomListCarousel;
