
import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import { CustomList } from '@/lib/types';
import DiscoverListCarousel from './DiscoverListCarousel';
import { getRandomCustomLists } from '@/lib/api';
import { toast } from 'sonner';

const RandomLists = () => {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true);
        console.log('RandomLists: Fetching custom lists...');
        // Get 3 random lists from Supabase
        const lists = await getRandomCustomLists(3);
        console.log(`RandomLists: Fetched ${lists.length} custom lists`);
        setCustomLists(lists);
      } catch (error) {
        console.error('Error fetching random custom lists:', error);
        toast.error('Fehler beim Laden der Listen');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, []);
  
  // Only show lists that have movies (now public access)
  const listsWithContent = customLists.filter(list => list.movies?.length > 0);
  
  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Shuffle className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-semibold">Filmlisten</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </section>
    );
  }
  
  if (listsWithContent.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Shuffle className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Filmlisten</h2>
      </div>
      
      <div>
        {listsWithContent.map(list => (
          <DiscoverListCarousel key={list.id} list={list} />
        ))}
      </div>
    </section>
  );
};

export default RandomLists;
