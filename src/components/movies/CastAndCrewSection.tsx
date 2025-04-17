
import { CastMember } from '@/lib/types';

interface CastAndCrewSectionProps {
  director?: CastMember;
  cast?: CastMember[];
}

const CastAndCrewSection = ({ director, cast }: CastAndCrewSectionProps) => {
  // Check if we have either director or cast to display
  const hasData = director || (cast && cast.length > 0);
  
  if (!hasData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Regie & Besetzung</h3>
      
      <div className="space-y-4">
        {/* Director Section */}
        {director && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Regie:</h4>
            <p className="text-sm">{director.name}</p>
          </div>
        )}

        {/* Cast Section */}
        {cast && cast.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Besetzung:</h4>
            <ul className="space-y-1">
              {cast.slice(0, 4).map((actor) => (
                <li key={actor.id || actor.name} className="text-sm">
                  <span className="font-medium">{actor.name}</span>
                  {actor.character && (
                    <span className="text-gray-500"> als {actor.character}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CastAndCrewSection;
