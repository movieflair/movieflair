
export type TMDBImageSize = 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'w1280' | 'original';

export interface TMDBImageConfig {
  base_url: string;
  secure_base_url: string;
  backdrop_sizes: string[];
  logo_sizes: string[];
  poster_sizes: string[];
  profile_sizes: string[];
  still_sizes: string[];
}

export interface TMDBImageDisplayProps {
  path?: string | null;
  size?: TMDBImageSize;
  type?: 'poster' | 'backdrop' | 'profile' | 'logo' | 'still';
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  apiKey?: string;
  configUrl?: string;
  onLoad?: () => void;
  onError?: () => void;
}
