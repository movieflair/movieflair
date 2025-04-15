
import { Film } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';

interface TrendingMoviesProps {
  movies: MovieOrShow[];
}

const TrendingMovies = ({ movies }: TrendingMoviesProps) => {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Film className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-semibold">Trending Filme</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default TrendingMovies;
