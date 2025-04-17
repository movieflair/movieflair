
import WatchlistButton from '@/components/movies/WatchlistButton';
import ShareButton from '@/components/movies/ShareButton';

interface MoviePosterProps {
  id: number;
  title: string;
  posterPath?: string;
}

const MoviePoster = ({ id, title, posterPath }: MoviePosterProps) => {
  const getImageSrc = (path?: string) => {
    if (!path) return null;
    
    if (path.startsWith('/storage')) {
      return path;
    } else if (path.startsWith('http')) {
      return path;
    } else if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    
    return `/storage/movie_images/posters/${path}`;
  };
  
  return (
    <div className="space-y-2">
      <div className="relative mb-2">
        <div className="rounded-lg overflow-hidden shadow-xl">
          {posterPath ? (
            <img
              src={getImageSrc(posterPath)}
              alt={title}
              className="w-full"
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
