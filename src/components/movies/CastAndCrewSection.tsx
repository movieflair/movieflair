
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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Regie & Besetzung</h3>
      <div className="flex flex-wrap gap-2 md:gap-4">
        {/* Director Section */}
        {director && (
          <div className="text-center w-16 md:w-20">
            <Avatar className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-1">
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
            <p className="text-xs font-medium truncate">{director.name}</p>
            <p className="text-xs text-gray-500 truncate">Regie</p>
          </div>
        )}

        {/* Cast Section */}
        {cast && cast.slice(0, 5).map((actor) => (
          <div key={actor.id} className="text-center w-16 md:w-20">
            <Avatar className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-1">
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
            <p className="text-xs font-medium truncate">{actor.name}</p>
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
