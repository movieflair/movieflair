
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackInteraction } from '@/lib/analyticsApi';

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
  const handlePrimeClick = () => {
    trackInteraction('prime_video_click');
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21';
    window.open(`https://www.amazon.de/gp/video/search?phrase=${formattedTitle}&tag=${tag}`, '_blank');
  };

  const handleTrailerClick = () => {
    trackInteraction('trailer_click');
    onTrailerClick();
  };

  const handleStreamClick = () => {
    trackInteraction('free_movie_click');
    onStreamClick();
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {hasTrailer && trailerUrl && (
        <Button
          variant="secondary"
          onClick={handleTrailerClick}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Trailer
        </Button>
      )}
      <Button
        className="bg-[rgba(26,152,255,255)] text-white hover:bg-[rgba(26,152,255,255)]/90"
        onClick={handlePrimeClick}
      >
        <Play className="w-4 h-4 mr-2" />
        Prime Video
      </Button>
      {streamUrl && (
        <Button
          className="bg-[#ea384c] text-white hover:bg-[#ea384c]/90 flex items-center gap-2"
          onClick={handleStreamClick}
        >
          <Play className="w-4 h-4" />
          Kostenlos
        </Button>
      )}
    </div>
  );
};

export default MovieStreamButtons;
