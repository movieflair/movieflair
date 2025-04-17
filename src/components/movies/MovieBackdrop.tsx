
import { getBackdropPath } from '@/utils/imageUtils';

interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  const imageSrc = getBackdropPath(backdropPath);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If image fails to load, try the TMDB path directly
    if (backdropPath && !backdropPath.startsWith('http')) {
      console.log(`Falling back to direct TMDB path for ${title} backdrop`);
      (e.target as HTMLImageElement).src = `https://image.tmdb.org/t/p/original${backdropPath}`;
    } else {
      console.error(`Failed to load backdrop for ${title}`);
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
