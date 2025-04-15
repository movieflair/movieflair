
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Genre, 
  getGenres, 
  getPopularMovies,
  MovieOrShow,
  getRandomCustomLists,
  CustomList
} from '@/lib/api';

import SearchSection from '@/components/discover/SearchSection';
import GenreGrid from '@/components/discover/GenreGrid';
import TrendingMovies from '@/components/discover/TrendingMovies';
import RandomLists from '@/components/discover/RandomLists';
import { toast } from 'sonner';

const Discover = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieOrShow[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [genresList, movies] = await Promise.all([
          getGenres(),
          getPopularMovies(),
        ]);
        setGenres(genresList);
        setPopularMovies(movies.slice(0, 4));
        
        // Benutzerdefinierte Listen abrufen
        const customListsData = getRandomCustomLists();
        console.log('Geladene benutzerdefinierte Listen:', customListsData);
        setCustomLists(customListsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Fehler beim Laden der Daten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <SearchSection />
          <GenreGrid genres={genres} />
          <TrendingMovies movies={popularMovies} />
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Lade Inhalte...</p>
            </div>
          ) : (
            <RandomLists customLists={customLists} />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Discover;
