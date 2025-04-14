
import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MovieRatingFeedbackProps {
  movieId: number;
}

const MovieRatingFeedback = ({ movieId }: MovieRatingFeedbackProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    try {
      setIsSubmitting(true);
      
      // Prüfen Sie, ob der Benutzer ein Admin ist - vermeiden Sie das Tracking von Admin-Aufrufen
      const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
      if (isAdmin) {
        // Wenn Admin, zeigen Sie eine spezielle Nachricht
        toast({
          title: "Admin-Feedback",
          description: "Admin-Feedback wird nicht in der Statistik erfasst.",
        });
        setHasVoted(true);
        return;
      }

      const { error } = await supabase
        .from('quick_tipp_ratings')
        .insert([
          { movie_id: movieId, is_helpful: isHelpful }
        ]);

      if (error) throw error;

      setHasVoted(true);
      toast({
        title: "Danke für dein Feedback!",
        description: isHelpful 
          ? "Schön, dass dir der Vorschlag gefallen hat." 
          : "Wir werden versuchen, bessere Vorschläge zu machen.",
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Fehler",
        description: "Dein Feedback konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <p className="text-gray-600 mt-6">
        Danke für dein Feedback!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4 mt-6">
      <p className="text-gray-600">War dieser Vorschlag hilfreich?</p>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => handleVote(true)}
        disabled={isSubmitting}
      >
        <ThumbsUp className="w-4 h-4" />
        Ja
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => handleVote(false)}
        disabled={isSubmitting}
      >
        <ThumbsDown className="w-4 h-4" />
        Nein
      </Button>
    </div>
  );
};

export default MovieRatingFeedback;
