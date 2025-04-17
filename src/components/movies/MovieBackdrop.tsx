
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
            src={backdropPath.startsWith('http') || backdropPath.startsWith('/storage') 
              ? backdropPath 
              : `https://image.tmdb.org/t/p/original${backdropPath}`}
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
