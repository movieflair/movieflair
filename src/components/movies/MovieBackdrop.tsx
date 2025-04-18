
import { TMDBImage } from '@/components/ui/tmdb-image';

interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  return (
    <div className="relative h-[400px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
      <TMDBImage
        path={backdropPath}
        size="original"
        alt={title}
        className="w-full h-full object-cover"
        priority={true} // Mark as priority since it's above the fold
      />
    </div>
  );
};

export default MovieBackdrop;
