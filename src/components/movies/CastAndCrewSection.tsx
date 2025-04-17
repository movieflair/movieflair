
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPublicImageUrl } from "@/utils/imageUtils";

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
  // Funktion zum Abrufen des Profilbilds direkt von TMDB
  const getProfileImageUrl = (path: string | undefined) => {
    if (!path) return null;
    return getPublicImageUrl(path);
  };

  // Check if we have either director or cast to display
  const hasData = director || (cast && cast.length > 0);
  
  if (!hasData) {
    return null;
  }

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
                  src={getProfileImageUrl(director.profile_path)}
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

        {/* Cast Section - limited to 4 members */}
        {cast && cast.slice(0, 4).map((actor) => (
          <div key={actor.id} className="text-center w-16 md:w-20">
            <Avatar className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-1">
              {actor.profile_path ? (
                <AvatarImage 
                  src={getProfileImageUrl(actor.profile_path)}
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
