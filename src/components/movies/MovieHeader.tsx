
import { Badge } from "@/components/ui/badge"

interface MovieHeaderProps {
  title: string;
  tagline?: string;
  releaseYear: string;
  genres?: { id: number; name: string }[];
}

const MovieHeader = ({ title, tagline, releaseYear, genres }: MovieHeaderProps) => {
  return (
    <>
      <h1 className="text-4xl font-semibold mb-2">{title}</h1>
      {tagline && (
        <p className="text-xl text-gray-500 mb-4 italic">
          {tagline}
        </p>
      )}

      <div className="flex flex-wrap gap-2 my-6">
        {genres?.map((genre) => (
          <Badge
            key={genre.id}
            variant="secondary"
            className="px-4 py-1 bg-gray-100 text-gray-700"
          >
            {genre.name}
          </Badge>
        ))}
      </div>
    </>
  );
};

export default MovieHeader;
