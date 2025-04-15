
import { MovieOrShow } from '@/lib/api';
import MovieCard from '@/components/movies/MovieCard';

interface MovieListProps {
  title: string;
  movies: MovieOrShow[];
}

const MovieList = ({ title, movies }: MovieListProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;
