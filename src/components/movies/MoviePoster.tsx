
import WatchlistButton from '@/components/movies/WatchlistButton';
import ShareButton from '@/components/movies/ShareButton';
import { TMDBImage } from '@/components/ui/tmdb-image';

interface MoviePosterProps {
  id: number;
  title: string;
  posterPath?: string;
}

const MoviePoster = ({ id, title, posterPath }: MoviePosterProps) => {
  return (
    <div className="space-y-2">
      <div className="relative mb-2">
        <div className="rounded-lg overflow-hidden shadow-xl">
          <TMDBImage
            path={posterPath}
            alt={title}
            className="w-full aspect-[2/3]"
            fallbackClassName="aspect-[2/3] flex items-center justify-center"
            priority={true} // Mark as priority since it's the main poster
          />
        </div>
      </div>
      <WatchlistButton mediaId={id} mediaType="movie" />
      <ShareButton movieTitle={title} />
    </div>
  );
};

export default MoviePoster;
