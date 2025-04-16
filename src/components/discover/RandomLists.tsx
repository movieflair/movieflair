
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomList } from '@/lib/types';
import DiscoverListCarousel from './DiscoverListCarousel';
import { getRandomCustomLists } from '@/lib/api';
import { toast } from 'sonner';
import { createUrlSlug } from '@/lib/urlUtils';
import { Button } from '@/components/ui/button';

const RandomLists = () => {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true);
        console.log('RandomLists: Fetching custom lists...');
        // Get only 1 newest list
        const lists = await getRandomCustomLists(1);
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
  
  // Only show lists that have movies
  const listsWithContent = customLists.filter(list => list.movies?.length > 0);
  
  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ListPlus className="w-6 h-6 text-theme-black" />
            <h2 className="text-2xl font-bold text-theme-black">Neuste Filmliste</h2>
          </div>
          <Link to="/filmlisten">
            <Button variant="outline">
              Alle anzeigen
            </Button>
          </Link>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-slate-200 rounded-lg"></div>
        </div>
      </section>
    );
  }
  
  if (listsWithContent.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListPlus className="w-6 h-6 text-theme-black" />
          <h2 className="text-2xl font-bold text-theme-black">Neuste Filmliste</h2>
        </div>
        <Link to="/filmlisten">
          <Button variant="outline">
            Alle anzeigen
          </Button>
        </Link>
      </div>
      
      <motion.div 
        key={listsWithContent[0].id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DiscoverListCarousel list={listsWithContent[0]} />
      </motion.div>
    </section>
  );
};

export default RandomLists;
