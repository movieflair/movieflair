
import { trackInteraction } from '@/lib/analyticsApi';

interface MovieTrailerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}

const MovieTrailerDialog = ({ isOpen, onClose, trailerUrl, movieTitle }: MovieTrailerDialogProps) => {
  if (!isOpen || !trailerUrl) return null;

  // Track trailer view
  if (isOpen) {
    trackInteraction('trailer_view', { title: movieTitle });
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-white/80"
        >
          Schließen
        </button>
        <div className="aspect-video">
          <iframe
            src={trailerUrl}
            title={`${movieTitle} Trailer`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default MovieTrailerDialog;
