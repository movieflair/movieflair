
interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
  return (
    <div className="relative h-[400px] overflow-hidden">
      {backdropPath ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
          <img
            src={backdropPath.startsWith('/storage') 
              ? backdropPath 
              : backdropPath.startsWith('http') 
                ? backdropPath 
                : `/storage/movie_images/backdrops/${backdropPath.replace(/^\//, '')}`}
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
