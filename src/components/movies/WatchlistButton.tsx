
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface WatchlistButtonProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  className?: string;
}

const WatchlistButton = ({ mediaId, mediaType, className = '' }: WatchlistButtonProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkWatchlistStatus();
  }, [mediaId, mediaType]);

  const checkWatchlistStatus = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('watchlist')
        .select('id')
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      setIsInWatchlist(!!data);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      toast({
        title: "Nicht eingeloggt",
        description: "Bitte melde dich an, um die Merkliste zu nutzen.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      if (isInWatchlist) {
        await supabase
          .from('watchlist')
          .delete()
          .eq('media_id', mediaId)
          .eq('media_type', mediaType)
          .eq('user_id', session.session.user.id);
        
        setIsInWatchlist(false);
        toast({
          description: "Von der Merkliste entfernt"
        });
      } else {
        await supabase
          .from('watchlist')
          .insert({
            media_id: mediaId,
            media_type: mediaType,
            user_id: session.session.user.id
          });
        
        setIsInWatchlist(true);
        toast({
          description: "Zur Merkliste hinzugefügt"
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: "Fehler",
        description: "Aktion konnte nicht ausgeführt werden",
        variant: "destructive"
      });
    }
  };

  if (isLoading) return null;

  return (
    <Button
      variant="secondary"
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      onClick={toggleWatchlist}
    >
      {isInWatchlist ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Gemerkt
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Merken
        </>
      )}
    </Button>
  );
};

export default WatchlistButton;
