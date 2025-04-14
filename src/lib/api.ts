
export interface Genre {
  id: number;
  name: string;
}

export interface MovieOrShow {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  hasStream?: boolean;
  streamUrl?: string;
  hasTrailer?: boolean;
}

export interface MovieDetail extends MovieOrShow {
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  genres?: Genre[];
  tagline?: string;
  homepage?: string;
  cast?: CastMember[];
  videos?: {
    results: {
      key: string;
      name: string;
      type: string;
      site?: string;
    }[];
  };
  hasStream?: boolean;
  streamUrl?: string;
  hasTrailer?: boolean;
}

export interface FilterOptions {
  genres?: number[];
  decades?: string[];
  moods?: string[];
}

export const moodToGenres: Record<string, number[]> = {
  happy: [35, 10751, 12], // Comedy, Family, Adventure
  sad: [18, 10749], // Drama, Romance
  thrilling: [28, 53, 27], // Action, Thriller, Horror
  thoughtful: [99, 36], // Documentary, History
  relaxing: [16, 10402], // Animation, Music 
  inspiring: [18, 36], // Drama, History
  romantic: [10749], // Romance
  exciting: [28, 12, 878], // Action, Adventure, Science Fiction
  nostalgic: [36, 10751], // History, Family
  suspenseful: [9648, 53], // Mystery, Thriller
  lighthearted: [35, 10751, 16], // Comedy, Family, Animation
};

const genres: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" }
];

interface CastMember {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path?: string;
}

const sampleMovies: MovieDetail[] = [
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/8kSerJrwkeaRfMt8DwMk1yemQAu.jpg',
    overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    vote_average: 8.4,
    release_date: '1999-10-15',
    genre_ids: [18],
    media_type: 'movie',
    hasStream: true,
    streamUrl: 'https://www.youtube.com/embed/BdJKm16Co6M',
    videos: {
      results: [
        {
          key: 'BdJKm16Co6M',
          name: 'Fight Club Trailer',
          type: 'Trailer',
          site: 'YouTube'
        }
      ]
    }
  },
  {
    id: 157336,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NUeztxU4eNNSGaV.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar expedition.',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [878, 12],
    media_type: 'movie',
    hasTrailer: true,
    videos: {
      results: [
        {
          key: 'zSWdZVtXT7E',
          name: 'Interstellar Trailer',
          type: 'Trailer',
          site: 'YouTube'
        }
      ]
    }
  },
  {
    id: 238,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolq1fllbFh.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    vote_average: 8.7,
    release_date: '1972-03-14',
    genre_ids: [18, 28],
    media_type: 'movie',
    videos: {
      results: [
        {
          key: 'sY1S34973zA',
          name: 'The Godfather Trailer',
          type: 'Trailer',
          site: 'YouTube'
        }
      ]
    }
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    poster_path: '/fITmhPr4tAB09eP3rr4Uqh3Qc79.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a song-and-dance man and a washed-up boxer converge in this sprawling, comedic crime caper.',
    vote_average: 8.5,
    release_date: '1994-09-10',
    genre_ids: [35, 18, 28],
    media_type: 'movie',
    hasStream: true,
    streamUrl: 'https://www.youtube.com/embed/5ZAhzsi1ybM',
    videos: {
      results: [
        {
          key: 's7EdQ4FqbhY',
          name: 'Pulp Fiction Trailer',
          type: 'Trailer',
          site: 'YouTube'
        }
      ]
    }
  }
];

export const getGenres = async (): Promise<Genre[]> => {
  return genres;
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  return sampleMovies;
};

export const getTrailerMovies = async (): Promise<MovieOrShow[]> => {
  return sampleMovies.filter(movie => movie.hasTrailer || (movie.videos?.results.length ?? 0) > 0);
};

export const getFreeMovies = async (): Promise<MovieOrShow[]> => {
  return sampleMovies.filter(movie => movie.hasStream);
};

export const getMovieById = async (id: number): Promise<MovieDetail> => {
  const movie = sampleMovies.find(m => m.id === id);
  if (!movie) throw new Error('Movie not found');
  
  return {
    ...movie,
    runtime: 120,
    genres: movie.genre_ids.map(id => genres.find(g => g.id === id)).filter(Boolean) as Genre[],
    tagline: "Ein beispielhafter Tagline",
    homepage: "https://example.com"
  };
};

export const getTvShowById = async (id: number): Promise<MovieDetail> => {
  throw new Error('TV Show not found');
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  const movies = await getPopularMovies();
  return [movies[Math.floor(Math.random() * movies.length)]];
};
