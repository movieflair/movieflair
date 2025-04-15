
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { MovieOrShow } from '@/lib/types';
import { getTvShowDetails, getCast } from '@/lib/tvShowApi';
import MovieCard from '@/components/movies/MovieCard';
import { PlayCircle } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import { generateTVShowSchema } from '@/utils/seoUtils';

const TvShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<MovieOrShow | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!id) {
        console.error('No ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const showData = await getTvShowDetails(id);
        const castData = await getCast(id, 'tv');

        setShow(showData);
        setCast(castData);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="bg-muted h-6 w-3/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-muted aspect-[2/3] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!show) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Serie nicht gefunden.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
  const seoTitle = `${show.name} (${firstAirYear}) Online Stream anschauen | MovieFlair`;
  const seoDescription = `${show.name} (${firstAirYear}) kostenlos online streamen. ${show.overview?.slice(0, 150)}...`;

  const tvShowStructuredData = generateTVShowSchema(show);

  return (
    <MainLayout>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        ogType="tv_show"
        ogImage={show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : undefined}
        structuredData={tvShowStructuredData}
      />
      <div className="container-custom py-12">
        <h1 className="text-3xl font-semibold mb-6">{show.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              className="rounded-lg shadow-md"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Übersicht</h2>
            <p className="text-muted-foreground mb-6">{show.overview}</p>

            <h2 className="text-xl font-semibold mb-4">Besetzung</h2>
            <div className="flex overflow-x-auto space-x-4">
              {cast.map((actor) => (
                <div key={actor.id} className="flex-shrink-0">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                    alt={actor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <p className="text-sm text-center mt-2">{actor.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TvShowDetails;
