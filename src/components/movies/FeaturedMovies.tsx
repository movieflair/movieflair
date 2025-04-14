
import { useQuery } from '@tanstack/react-query';
import MovieCard from './MovieCard';
import { getPopularMovies, MovieOrShow } from '@/lib/api';

const FeaturedMovies = () => {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['featuredMovies'],
    queryFn: getPopularMovies,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted animate-pulse h-[360px] rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {movies?.slice(0, 4).map((movie: MovieOrShow) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default FeaturedMovies;
