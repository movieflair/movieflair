
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import MovieCard from '@/components/movies/MovieCard';
import { Bookmark } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Watchlist = () => {
  const [items, setItems] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchWatchlist();
    }
  }, [user, authLoading]);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const { data: watchlistItems, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlist:', error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Deine Merkliste konnte nicht geladen werden."
        });
        throw error;
      }

      console.log('Watchlist items:', watchlistItems);

      if (watchlistItems && watchlistItems.length > 0) {
        // Fetch details for each item from your API
        const detailedItems = await Promise.all(
          watchlistItems.map(async (item) => {
            const response = await fetch(
              `https://bjuzoovrgsozkcdgrxnj.functions.supabase.co/tmdb`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
                },
                body: JSON.stringify({
                  path: `/${item.media_type}/${item.media_id}`,
                  searchParams: { language: 'de-DE' }
                })
              }
            );
            
            if (!response.ok) {
              throw new Error(`Error fetching details for ${item.media_type}/${item.media_id}`);
            }
            
            const data = await response.json();
            return {
              ...data,
              media_type: item.media_type
            };
          })
        );
        
        console.log('Detailed items:', detailedItems);
        setItems(detailedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einige Filme konnten nicht geladen werden."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <EnhancedLayout>
        <div className="container-custom py-12">
          <div className="text-center">Lädt...</div>
        </div>
      </EnhancedLayout>
    );
  }

  return (
    <EnhancedLayout>
      <div className="container-custom py-12">
        <div className="flex items-center mb-8">
          <Bookmark className="w-6 h-6 text-[#ff3131] mr-2" />
          <h1 className="text-3xl font-semibold">Merkliste</h1>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-[2/3] rounded-lg mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Deine Merkliste ist noch leer.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-[#ff3131] text-white rounded-md hover:bg-[#ff3131]/90 transition-colors"
            >
              Filme entdecken
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        )}
      </div>
    </EnhancedLayout>
  );
};

export default Watchlist;
