
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Genre, 
  getGenres, 
  getPopularMovies,
  MovieOrShow,
  getRecommendationByFilters, 
  getRandomCustomLists,
  CustomList
} from '@/lib/api';

import SearchSection from '@/components/discover/SearchSection';
import GenreGrid from '@/components/discover/GenreGrid';
import TrendingMovies from '@/components/discover/TrendingMovies';
import RandomLists from '@/components/discover/RandomLists';

const Discover = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieOrShow[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MovieOrShow[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<MovieOrShow[]>([]);
  const [actionMovies, setActionMovies] = useState<MovieOrShow[]>([]);
  const [documentaryMovies, setDocumentaryMovies] = useState<MovieOrShow[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [genresList, movies] = await Promise.all([
          getGenres(),
          getPopularMovies(),
        ]);
        setGenres(genresList);
        setPopularMovies(movies.slice(0, 4));

        const sciFi = await getRecommendationByFilters({ genres: [878], mediaType: 'movie' });
        const romance = await getRecommendationByFilters({ genres: [10749], mediaType: 'movie' });
        const action = await getRecommendationByFilters({ genres: [28], mediaType: 'movie' });
        const documentary = await getRecommendationByFilters({ genres: [99], mediaType: 'movie' });

        setSciFiMovies(sciFi.slice(0, 4));
        setRomanceMovies(romance.slice(0, 4));
        setActionMovies(action.slice(0, 4));
        setDocumentaryMovies(documentary.slice(0, 4));
        
        // Benutzerdefinierte Listen abrufen - hier rufen wir alle Listen ab (nicht auf 2 beschränkt)
        const customListsData = getRandomCustomLists();
        setCustomLists(customListsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
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
          <RandomLists 
            sciFiMovies={sciFiMovies}
            romanceMovies={romanceMovies}
            actionMovies={actionMovies}
            documentaryMovies={documentaryMovies}
            customLists={customLists}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Discover;
