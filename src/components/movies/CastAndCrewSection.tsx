
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  job?: string;
}

interface CastAndCrewSectionProps {
  director?: CastMember;
  cast?: CastMember[];
}

const CastAndCrewSection = ({ director, cast }: CastAndCrewSectionProps) => {
  // Add console logs for debugging
  console.log('Director:', director);
  console.log('Cast:', cast);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Besetzung</h3>
      <div className="flex gap-3">
        {/* Director Section */}
        {director && (
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              {director.profile_path ? (
                <AvatarImage 
                  src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                  alt={director.name}
                />
              ) : (
                <AvatarFallback className="text-sm">
                  {director.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-sm font-medium truncate">{director.name}</p>
            <p className="text-xs text-gray-500 truncate">Regie</p>
          </div>
        )}

        {/* Cast Section */}
        {cast && cast.slice(0, 4).map((actor) => (
          <div key={actor.id} className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              {actor.profile_path ? (
                <AvatarImage 
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                />
              ) : (
                <AvatarFallback className="text-sm">
                  {actor.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-sm font-medium truncate">{actor.name}</p>
            {actor.character && (
              <p className="text-xs text-gray-500 truncate">{actor.character}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastAndCrewSection;
