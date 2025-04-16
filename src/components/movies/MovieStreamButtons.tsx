
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackInteraction } from '@/lib/analyticsApi';

interface MovieStreamButtonsProps {
  hasTrailer: boolean;
  trailerUrl: string | null;
  streamUrl?: string;
  title: string;
  amazonAffiliateId?: string;
  isFreeMovie?: boolean;
  hasStream?: boolean;
  onTrailerClick: () => void;
  onStreamClick: () => void;
}

const MovieStreamButtons = ({
  hasTrailer,
  trailerUrl,
  streamUrl,
  title,
  amazonAffiliateId,
  isFreeMovie,
  hasStream,
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
        className="bg-[#0678ff] text-white hover:bg-[#0678ff]/90 flex items-center gap-1"
        onClick={handlePrimeClick}
      >
        <Play className="w-4 h-4" />
        Prime Video
      </Button>
      {(streamUrl || isFreeMovie === true || hasStream === true) && (
        <Button
          className="bg-[#ff3131] text-white hover:bg-[#ff3131]/90 flex items-center gap-1"
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
