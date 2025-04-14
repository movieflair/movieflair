
export interface Genre {
  id: number;
  name: string;
}

export interface MovieOrShow {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
}

export interface MovieDetail extends MovieOrShow {
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
}

export interface FilterOptions {
  moods?: string[];
  genres?: number[];
  decades?: string[];
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

// Mock API functions
export const getGenres = async (): Promise<Genre[]> => {
  return genres;
};

export const getPopularMovies = async (): Promise<MovieOrShow[]> => {
  return [
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
      overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
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
};

export const getMovieById = async (id: string): Promise<MovieDetail> => {
  const movies = await getPopularMovies();
  const movie = movies.find(m => m.id === parseInt(id));
  if (!movie) throw new Error('Movie not found');
  return { ...movie, runtime: 120 };
};

export const getTvShowById = async (id: string): Promise<MovieDetail> => {
  throw new Error('TV Show not found');
};

export const getRecommendationByFilters = async (filters: FilterOptions): Promise<MovieOrShow[]> => {
  return getPopularMovies();
};

