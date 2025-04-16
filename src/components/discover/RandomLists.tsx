
import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import { CustomList } from '@/lib/api';
import CustomListCarousel from '../movies/CustomListCarousel';
import { getCustomLists } from '@/lib/customListApi';

const RandomLists = () => {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true);
        const lists = await getCustomLists();
        setCustomLists(lists);
      } catch (error) {
        console.error('Error fetching custom lists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, []);
  
  // Only show lists that have movies (now public access)
  const listsWithContent = customLists.filter(list => list.movies.length > 0);
  
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
          <CustomListCarousel key={list.id} list={list} />
        ))}
      </div>
    </section>
  );
};

export default RandomLists;
