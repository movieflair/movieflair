
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
import { CustomList } from '@/lib/api';
import MovieCard from './MovieCard';
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
                onClick={handlePrevClick}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 rounded-full bg-white/90 backdrop-blur p-0 hover:bg-white/95" 
                onClick={handleNextClick}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Movie covers section - 2/3 width */}
          <div className="w-2/3 relative">
            <div className="flex justify-center items-center relative h-[200px]">
              {list.movies.slice(0, 3).map((movie, index) => (
                <div 
                  key={movie.id}
                  className="absolute w-[120px] transition-transform duration-300 hover:z-20 hover:scale-105 cursor-pointer"
                  style={{
                    transform: `translateX(${(index - 1) * 65}px)`,
                    zIndex: 10 + index,
                  }}
                >
                  <MovieCard movie={movie} size="small" hideDetails />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomListCarousel;

