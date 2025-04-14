
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
    <div className="space-y-12">
      {/* Director Section */}
      {director && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Regie</h2>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {director.profile_path ? (
                <AvatarImage 
                  src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                  alt={director.name}
                />
              ) : (
                <AvatarFallback>
                  {director.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-xl">{director.name}</span>
          </div>
        </div>
      )}

      {/* Cast Section */}
      {cast && cast.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Besetzung</h2>
          <div className="grid gap-6">
            {cast.map((actor) => (
              <div key={actor.id} className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {actor.profile_path ? (
                    <AvatarImage 
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {actor.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-xl">{actor.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CastAndCrewSection;
