
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
    
    // Wenn der Pfad bereits ein lokaler Storage-Pfad ist
    if (path.startsWith('/storage')) {
      return path;
    } 
    // Für die Übergangszeit: falls noch externe URLs im System sind
    else if (path.startsWith('http')) {
      console.warn('Externe Bild-URL gefunden:', path);
      // Hier könnten wir einen automatischen Download anstoßen
      return path;
    } 
    // TMDB-Pfade sollten nicht mehr vorkommen, aber zur Sicherheit:
    else if (path.startsWith('/')) {
      console.warn('TMDB-Pfad gefunden, sollte bereits importiert sein:', path);
      // Wir versuchen trotzdem, die lokale Version zu verwenden
      return `/storage/movie_images/posters/${path.replace(/^\//, '')}`;
    }
    
    // Standard: Wir nehmen an, dass es ein Dateiname in unserem Storage ist
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
