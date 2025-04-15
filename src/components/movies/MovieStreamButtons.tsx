
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieStreamButtonsProps {
  hasTrailer: boolean;
  trailerUrl: string | null;
  streamUrl?: string;
  title: string;
  amazonAffiliateId?: string;
  onTrailerClick: () => void;
  onStreamClick: () => void;
}

const MovieStreamButtons = ({
  hasTrailer,
  trailerUrl,
  streamUrl,
  title,
  amazonAffiliateId,
  onTrailerClick,
  onStreamClick
}: MovieStreamButtonsProps) => {
  const getAmazonUrl = (title: string) => {
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21';
    return `https://www.amazon.de/gp/video/search?phrase=${formattedTitle}&tag=${tag}`;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {hasTrailer && trailerUrl && (
        <Button
          variant="secondary"
          onClick={onTrailerClick}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Trailer
        </Button>
      )}
      <a
        href={getAmazonUrl(title)}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[rgba(26,152,255,255)] text-white px-6 py-2 rounded-md hover:bg-[rgba(26,152,255,255)]/90 transition-colors flex items-center gap-2"
      >
        <Play className="w-4 h-4" />
        Prime Video
      </a>
      {streamUrl && (
        <Button
          className="bg-[#ea384c] text-white hover:bg-[#ea384c]/90 flex items-center gap-2"
          onClick={onStreamClick}
        >
          <Play className="w-4 h-4" />
          Kostenlos
        </Button>
      )}
    </div>
  );
};

export default MovieStreamButtons;
