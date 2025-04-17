
import WatchlistButton from '@/components/movies/WatchlistButton';
import ShareButton from '@/components/movies/ShareButton';
import { getPosterPath } from '@/utils/imageUtils';

interface MoviePosterProps {
  id: number;
  title: string;
  posterPath?: string;
}

const MoviePoster = ({ id, title, posterPath }: MoviePosterProps) => {
  const imageSrc = getPosterPath(posterPath);
  
  return (
    <div className="space-y-2">
      <div className="relative mb-2">
        <div className="rounded-lg overflow-hidden shadow-xl">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className="w-full"
              onError={(e) => {
                console.error(`Error loading poster for ${title}:`, e);
                // Fallback to TMDB if our storage fails
                if (posterPath && posterPath.startsWith('/') && !posterPath.startsWith('/storage')) {
                  (e.target as HTMLImageElement).src = `https://image.tmdb.org/t/p/w500${posterPath}`;
                }
              }}
            />
          ) : (
            <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Kein Poster</span>
            </div>
          )}
        </div>
      </div>
      <WatchlistButton mediaId={id} mediaType="movie" />
      <ShareButton movieTitle={title} />
    </div>
  );
};

export default MoviePoster;
