
import { useEffect, useState } from 'react';
import { getCustomLists } from '@/lib/api';
import { CustomList } from '@/lib/types';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import { List, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { createUrlSlug } from '@/lib/urlUtils';
import { formatListTitle, formatListDescription, DEFAULT_SEO } from '@/utils/seoHelpers';

const AllLists = () => {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const fetchedLists = await getCustomLists();
        setLists(fetchedLists.filter(list => list.movies?.length > 0));
      } catch (error) {
        console.error('Error fetching lists:', error);
        toast.error('Listen konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, []);

  const seoTitle = formatListTitle("Filmlisten");
  const seoDescription = formatListDescription(
    "Filmlisten", 
    "Entdecke kuratierte Filmlisten auf MovieFlair. Von Klassikern bis zu versteckten Perlen - finde die perfekte Auswahl für deinen nächsten Filmabend."
  );
  const canonical = `${window.location.origin}/listen`;

  return (
    <MainLayout>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords="Filmlisten, Filmsammlungen, Filmempfehlungen, kuratierte Listen, Filmtipps, Filmkategorien, Filmgenres"
        ogType="website"
        canonical={canonical}
      />
      
      <div className="container-custom py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <List className="w-6 h-6 text-theme-accent-red" />
            <h1 className="text-3xl font-bold">Filmlisten</h1>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  to={`/liste/${createUrlSlug(list.title)}`}
                  className="group block bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-theme-accent-red/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold group-hover:text-theme-accent-red transition-colors">
                      {list.title}
                    </h2>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-theme-accent-red group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  {list.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{list.movies.length} Filme</span>
                  </div>
                  
                  {list.movies.length > 0 && (
                    <div className="mt-4 flex -space-x-4">
                      {list.movies.slice(0, 4).map((movie) => (
                        <img
                          key={movie.id}
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title || movie.name}
                          className="w-12 h-16 object-cover rounded-lg border-2 border-white"
                        />
                      ))}
                      {list.movies.length > 4 && (
                        <div className="w-12 h-16 flex items-center justify-center bg-muted rounded-lg border-2 border-white">
                          <span className="text-xs font-medium">+{list.movies.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AllLists;
