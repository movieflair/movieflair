
interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  const getImageSrc = (path?: string) => {
    if (!path) return null;
    
    if (path.startsWith('/storage')) {
      return path;
    } else if (path.startsWith('http')) {
      return path;
    } else if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/original${path}`;
    }
    
    return `/storage/movie_images/backdrops/${path}`;
  };
  
  return (
    <div className="relative h-[400px] overflow-hidden">
      {backdropPath ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
          <img
            src={getImageSrc(backdropPath)}
            alt={title}
            className="w-full h-full object-cover"
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
    </div>
  );
};

export default MovieBackdrop;
