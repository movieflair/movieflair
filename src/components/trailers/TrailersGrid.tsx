
import { MovieOrShow } from '@/lib/api';
import TrailerCard from '@/components/movies/TrailerCard';

interface TrailersGridProps {
  trailerItems: MovieOrShow[];
  isLoading: boolean;
}

const TrailersGrid = ({ trailerItems, isLoading }: TrailersGridProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {isLoading ? 'Lade Trailer...' : 'Die neusten Trailer'}
        </h2>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-muted aspect-video rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : trailerItems.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-background/50">
          <p className="text-muted-foreground">Keine neuen Trailer gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trailerItems.map((item) => (
            <TrailerCard key={item.id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrailersGrid;
