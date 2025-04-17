
interface MovieBackdropProps {
  backdropPath?: string;
  title: string;
}

const MovieBackdrop = ({ backdropPath, title }: MovieBackdropProps) => {
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
      return `/storage/movie_images/backdrops/${path.replace(/^\//, '')}`;
    }
    
    // Standard: Wir nehmen an, dass es ein Dateiname in unserem Storage ist
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
