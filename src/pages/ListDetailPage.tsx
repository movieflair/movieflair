
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { CustomList, getCustomList, getCustomLists } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Seo } from '@/components/seo/Seo';
import MovieCard from '@/components/movies/MovieCard';
import { createUrlSlug } from '@/lib/urlUtils';
import { formatListTitle, formatListDescription } from '@/utils/seoHelpers';

const ListDetailPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<CustomList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const allLists = await getCustomLists();
        const foundList = allLists.find(list => createUrlSlug(list.title) === slug);
        
        if (foundList) {
          setList(foundList);
          setError(null);
        } else {
          setError('Diese Liste konnte nicht gefunden werden.');
        }
      } catch (err) {
        console.error('Error fetching list:', err);
        setError('Diese Liste konnte nicht gefunden werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/entdecken" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zurück zu Entdecken
            </Link>
          </div>
          
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded-lg w-2/3"></div>
            <div className="h-6 bg-muted rounded-lg w-1/2"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !list) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/entdecken" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zurück zu Entdecken
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Liste nicht gefunden</h2>
            <p className="text-muted-foreground mb-6">{error || 'Diese Liste existiert nicht oder wurde gelöscht.'}</p>
            <Button asChild>
              <Link to="/entdecken">Alle Listen entdecken</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (list) {
    const listDescription = list.description || `Entdecke ${list.movies.length} ausgewählte Filme in dieser kuratierten Sammlung.`;
    
    const seoTitle = formatListTitle(list.title);
    const seoDescription = formatListDescription(list.title, listDescription);
    const seoOgImage = list.movies[0]?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${list.movies[0].backdrop_path}` 
      : '/movieflair-logo.png';

    return (
      <MainLayout>
        <Seo 
          title={seoTitle}
          description={seoDescription}
          ogImage={seoOgImage}
          ogType="website"
          keywords={`Filmliste, ${list.title}, Filme, Streaming, ${list.movies.map(m => m.title).join(', ')}`}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": list.title,
            "description": list.description || `Liste mit ${list.movies.length} Filmen`,
            "numberOfItems": list.movies.length,
            "itemListElement": list.movies.map((movie, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Movie",
                "name": movie.title,
                "image": movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
                "url": `/film/${movie.id}/${createUrlSlug(movie.title)}`
              }
            }))
          }}
        />
        
        <div className="container-custom py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/filmlisten" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zurück zu allen Listen
            </Link>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
            
            {list?.movies.length > 0 && list.movies[0].backdrop_path && (
              <div className="absolute inset-0">
                <img 
                  src={`https://image.tmdb.org/t/p/w1280${list.movies[0].backdrop_path}`} 
                  alt={list.title}
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
            )}
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{list?.title}</h1>
                  {list?.description && (
                    <p className="text-white/80 max-w-2xl text-lg">{list.description}</p>
                  )}
                </div>
                
                <Button 
                  asChild
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Link to="/filmlisten">
                    <List className="w-4 h-4" />
                    Alle Listen
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Filme in dieser Liste</h2>
              <span className="text-muted-foreground">{list?.movies.length} Filme</span>
            </div>
            
            {list?.movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {list.movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg bg-background/50">
                <p className="text-muted-foreground">Diese Liste enthält noch keine Filme</p>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return null;
};

export default ListDetailPage;
