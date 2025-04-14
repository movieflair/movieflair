
import { Share, Copy, Facebook, Twitter, WhatsApp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface ShareButtonProps {
  movieTitle: string;
  className?: string;
}

const ShareButton = ({ movieTitle, className }: ShareButtonProps) => {
  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link wurde kopiert!");
    } catch (err) {
      toast.error("Fehler beim Kopieren des Links");
    }
  };

  const shareToWhatsApp = () => {
    const text = `Schau dir "${movieTitle}" an!\n${currentUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Schau dir "${movieTitle}" an!`)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={`w-full flex items-center justify-center gap-2 ${className}`}
        >
          <Share className="h-4 w-4" />
          Teilen
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleCopyLink}
          >
            <Copy className="mr-2 h-4 w-4" />
            Link kopieren
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={shareToWhatsApp}
          >
            <WhatsApp className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={shareToTwitter}
          >
            <Twitter className="mr-2 h-4 w-4" />
            X
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={shareToFacebook}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;

