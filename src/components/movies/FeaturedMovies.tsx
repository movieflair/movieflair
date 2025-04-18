
import { useQuery } from '@tanstack/react-query';
import MovieCard from './MovieCard';
import { getPopularMovies, MovieOrShow } from '@/lib/api';

const initialFeaturedMovies: MovieOrShow[] = [
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/8kSerJrwkeaRfMt8DwMk1yemQAu.jpg',
    overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    vote_average: 8.4,
    release_date: '1999-10-15',
    genre_ids: [18],
    media_type: 'movie'
  },
  {
    id: 157336,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NUeztxU4eNNSGaV.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar expedition.',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [878, 12],
    media_type: 'movie'
  },
  {
    id: 238,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolq1fllbFh.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    vote_average: 8.7,
    release_date: '1972-03-14',
    genre_ids: [18, 28],
    media_type: 'movie'
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    poster_path: '/fITmhPr4tAB09eP3rr4Uqh3Qc79.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a song-and-dance man and a washed-up boxer converge in this sprawling, comedic crime caper.',
    vote_average: 8.5,
    release_date: '1994-09-10',
    genre_ids: [35, 18, 28],
    media_type: 'movie'
  }
];

const FeaturedMovies = () => {
  const { data: movies = initialFeaturedMovies, isLoading } = useQuery({
    queryKey: ['featuredMovies'],
    queryFn: getPopularMovies,
    placeholderData: initialFeaturedMovies
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
      {movies.slice(0, 4).map((movie: MovieOrShow) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default FeaturedMovies;
