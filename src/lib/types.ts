
export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  job?: string;
}

export interface MovieOrShow {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  hasStream?: boolean;
  streamUrl?: string;
  hasTrailer?: boolean;
  trailerUrl?: string;
  isFreeMovie?: boolean;
  isNewTrailer?: boolean;
}

export interface MovieDetail extends MovieOrShow {
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  genres?: Genre[];
  tagline?: string;
  homepage?: string;
  cast?: CastMember[];
  crew?: CastMember[];
  videos?: {
    results: {
      key: string;
      name: string;
      type: string;
      site?: string;
    }[];
  };
}

export interface FilterOptions {
  genres?: number[];
  decades?: string[];
  moods?: string[];
  rating?: number;
  mediaType?: 'movie' | 'tv' | 'all';
}

export interface VisitorStat {
  date: string;
  count: number;
  page: string;
}

export interface CustomList {
  id: string;
  title: string;
  description: string;
  movies: MovieOrShow[];
  createdAt: string;
  updatedAt: string;
}
