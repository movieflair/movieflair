
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
        // Always get the newest list for the Discover page
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
  
  // If no lists were found, show a placeholder instead of returning null
  if (customLists.length === 0) {
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-4xl mx-auto text-center"
        >
          <p className="text-gray-500 mb-4">Es wurden noch keine Filmlisten erstellt.</p>
          <Link to="/filmlisten">
            <Button>Filmlisten erkunden</Button>
          </Link>
        </motion.div>
      </section>
    );
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
        key={customLists[0].id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {customLists[0].movies && customLists[0].movies.length > 0 ? (
          <DiscoverListCarousel list={customLists[0]} />
        ) : (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-4xl mx-auto relative"
          >
            <div className="flex items-center gap-2 mb-4">
              <ListPlus className="w-6 h-6 text-black" />
              <Link 
                to={`/liste/${createUrlSlug(customLists[0].title)}`}
                className="text-2xl font-semibold hover:text-gray-800 transition-colors"
              >
                {customLists[0].title}
              </Link>
            </div>
            
            {customLists[0].description && (
              <p className="text-sm text-gray-600 mb-4">
                {customLists[0].description}
              </p>
            )}
            
            <p className="text-gray-500 py-4 text-center">
              Diese Liste enthält noch keine Filme.
            </p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default RandomLists;
