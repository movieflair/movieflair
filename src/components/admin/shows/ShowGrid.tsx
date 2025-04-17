
import { Tv, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MovieOrShow } from "@/lib/types";

interface ShowGridProps {
  shows: MovieOrShow[];
  onEditShow: (show: MovieOrShow) => void;
  isLoading: boolean;
  searchQuery: string;
}

const ShowGrid = ({ shows, onEditShow, isLoading, searchQuery }: ShowGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Lade Serien...</p>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? 'Keine Serien gefunden.' : 'Keine Serien verfügbar.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shows.map(show => (
        <div 
          key={show.id} 
          className="border border-border rounded-md p-4 hover:bg-muted/30 cursor-pointer transition-colors"
          onClick={() => onEditShow(show)}
        >
          <div className="flex items-start">
            <div className="w-16 h-24 bg-muted rounded overflow-hidden">
              {show.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${show.poster_path}`} 
                  alt={show.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Tv className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="ml-4 flex-grow">
              <h4 className="font-medium">{show.name}</h4>
              <p className="text-sm text-muted-foreground">
                {show.first_air_date?.substring(0, 4) || 'Unbekanntes Jahr'}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {show.hasStream && (
                  <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Stream verfügbar
                  </span>
                )}
                {show.hasTrailer && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Trailer
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowGrid;
