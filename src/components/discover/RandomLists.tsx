
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomList } from '@/lib/types';
import DiscoverListCarousel from './DiscoverListCarousel';
import { getRandomCustomLists } from '@/lib/api';
import { toast } from 'sonner';
import { createUrlSlug } from '@/lib/urlUtils';

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ListPlus className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-slate-900">Filmlisten</h2>
          </div>
          <Link 
            to="/filmlisten" 
            className="text-sm font-medium flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            Alle anzeigen
            <ArrowRight className="ml-1 w-4 h-4" />
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
          <ListPlus className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900">Filmlisten</h2>
        </div>
        <Link 
          to="/filmlisten" 
          className="text-sm font-medium flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          Alle anzeigen
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <div className="space-y-8">
        {listsWithContent.map((list, index) => (
          <motion.div 
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <DiscoverListCarousel key={list.id} list={list} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RandomLists;
