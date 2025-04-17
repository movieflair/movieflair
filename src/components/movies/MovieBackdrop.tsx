
import { getBackdropPath } from '@/utils/imageUtils';

interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  const imageSrc = getBackdropPath(backdropPath);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Fehler beim Laden des Hintergrundbilds für ${title}:`, e);
    
    // Wenn es ein lokales Bild ist, das fehlschlägt, setze direkt auf den TMDB-Pfad
    if (backdropPath && backdropPath.startsWith('/') && !backdropPath.startsWith('/storage')) {
      (e.target as HTMLImageElement).src = `https://image.tmdb.org/t/p/original${backdropPath}`;
    }
  };
  
  return (
    <div className="relative h-[400px] overflow-hidden">
      {imageSrc ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
            onError={handleError}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
    </div>
  );
};

export default MovieBackdrop;
