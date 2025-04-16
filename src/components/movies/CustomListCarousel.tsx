
import { Link } from 'react-router-dom';
import { ListPlus } from 'lucide-react';
import { CustomList } from '@/lib/api';
import MovieCard from './MovieCard';
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
    <div className="w-full mb-8">
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100/50">
        <div className="flex flex-col gap-6">
          {/* Header section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Link 
                to="/discover" 
                className="group flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-theme-accent-blue transition-colors"
              >
                <ListPlus className="w-5 h-5 text-theme-accent-blue group-hover:scale-110 transition-transform" />
                {list.title}
              </Link>
              <p className="text-sm text-gray-600 max-w-[500px]">
                {list.description}
              </p>
            </div>
          </div>

          {/* Movie carousel section */}
          <div className="w-full">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {list.movies.map((movie) => (
                  <CarouselItem key={movie.id} className="pl-4 basis-1/5">
                    <div className="transition-all duration-300 hover:scale-105">
                      <MovieCard movie={movie} size="small" hideDetails />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-2 mt-4">
                <CarouselPrevious className="relative static translate-y-0 h-8 w-8 rounded-full bg-white/90 backdrop-blur hover:bg-white/95" />
                <CarouselNext className="relative static translate-y-0 h-8 w-8 rounded-full bg-white/90 backdrop-blur hover:bg-white/95" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomListCarousel;
