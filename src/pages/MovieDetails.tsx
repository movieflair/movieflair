
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import MainLayout from '@/components/layout/MainLayout';
import MovieLoadingState from '@/components/movies/MovieLoadingState';
import MovieErrorState from '@/components/movies/MovieErrorState';
import SimilarMovies from '@/components/movies/SimilarMovies';
import { useMovieData } from '@/components/movies/useMovieData';
import { MovieSeoData } from '@/components/movies/MovieSeoData';
import { MovieContent } from '@/components/movies/MovieContent';

const MovieDetails = () => {
  const { id, slug } = useParams<{ id: string, slug?: string }>();
  const { amazonAffiliateId = '' } = useAdminSettings?.() || {};
  const { movie, isLoading, similarMovies } = useMovieData(id, slug);

  if (isLoading) {
    return (
      <MainLayout>
        <MovieLoadingState />
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <MovieErrorState />
      </MainLayout>
    );
  }

  const director = movie.crew?.find(person => person.job === 'Director');

  return (
    <MainLayout>
      <MovieSeoData movie={movie} director={director} />
      <div className="pb-12">
        <MovieContent movie={movie} amazonAffiliateId={amazonAffiliateId} />
        
        <div className="container mx-auto mt-12 px-4 md:px-6 max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Ähnliche Filme</h2>
          <SimilarMovies movies={similarMovies} />
        </div>
      </div>
    </MainLayout>
  );
};

export default MovieDetails;
