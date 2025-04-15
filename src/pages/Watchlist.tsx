
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import MovieCard from '@/components/movies/MovieCard';
import { Bookmark } from 'lucide-react';
import { MovieOrShow } from '@/lib/api';

const Watchlist = () => {
  const [items, setItems] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchWatchlist();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchWatchlist = async () => {
    try {
      const { data: watchlistItems } = await supabase
        .from('watchlist')
        .select('*')
        .order('added_at', { ascending: false });

      if (watchlistItems) {
        // Fetch details for each item from your API
        const detailedItems = await Promise.all(
          watchlistItems.map(async (item) => {
            const response = await fetch(
              `https://bjuzoovrgsozkcdgrxnj.functions.supabase.co/tmdb`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  path: `/${item.media_type}/${item.media_id}`,
                  searchParams: { language: 'de-DE' }
                })
              }
            );
            const data = await response.json();
            return {
              ...data,
              media_type: item.media_type
            };
          })
        );
        setItems(detailedItems);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EnhancedLayout>
      <div className="container-custom py-12">
        <div className="flex items-center mb-8">
          <Bookmark className="w-6 h-6 text-primary mr-2" />
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
