
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import MainLayout from '@/components/layout/MainLayout';
import { 
  Genre, 
  getGenres, 
  getPopularMovies,
  getFreeMovies,
  getTrailerMovies,
  MovieOrShow,
  getRandomCustomLists,
  CustomList
} from '@/lib/api';

import HeroSection from '@/components/discover/HeroSection';
import TrendingMovies from '@/components/discover/TrendingMovies';
import RandomLists from '@/components/discover/RandomLists';
import FreeMoviesSection from '@/components/discover/FreeMoviesSection';
import TrailersSection from '@/components/discover/TrailersSection';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Discover = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieOrShow[]>([]);
  const [freeMovies, setFreeMovies] = useState<MovieOrShow[]>([]);
  const [trailerMovies, setTrailerMovies] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        console.log('Discover: Fetching initial data...');
        const [genresList, movies, freeMoviesList, trailersList] = await Promise.all([
          getGenres(),
          getPopularMovies(),
          getFreeMovies(),
          getTrailerMovies(),
        ]);
        
        setGenres(genresList);
        setPopularMovies(movies.slice(0, 8));
        setFreeMovies(freeMoviesList.slice(0, 4));
        setTrailerMovies(trailersList.slice(0, 4));
        
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <HeroSection />
        
        <motion.div 
          className="container-custom py-12 px-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Lade Inhalte...</p>
            </div>
          ) : (
            <>
              <motion.div variants={item} className="mb-16">
                <TrendingMovies movies={popularMovies} />
              </motion.div>
              
              <motion.div variants={item} className="mb-16">
                <RandomLists />
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <motion.div variants={item}>
                  <FreeMoviesSection movies={freeMovies} />
                </motion.div>
                <motion.div variants={item}>
                  <TrailersSection movies={trailerMovies} />
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Discover;
