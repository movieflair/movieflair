
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
    <div className="space-y-8">
      {/* Director Section */}
      {director && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Regie</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-2">
                {director.profile_path ? (
                  <AvatarImage 
                    src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                    alt={director.name}
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {director.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium text-center">{director.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cast Section */}
      {cast && cast.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Besetzung</h2>
          <div className="flex flex-wrap gap-4">
            {cast.map((actor) => (
              <div key={actor.id} className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-2">
                  {actor.profile_path ? (
                    <AvatarImage 
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {actor.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium text-center">{actor.name}</span>
                {actor.character && <span className="text-xs text-gray-500 text-center">{actor.character}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CastAndCrewSection;
