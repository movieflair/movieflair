
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import MainLayout from '@/components/layout/MainLayout';
import MovieLoadingState from '@/components/movies/MovieLoadingState';
import MovieErrorState from '@/components/movies/MovieErrorState';
import SimilarMovies from '@/components/movies/SimilarMovies';
import { useShowData } from '@/components/tvShows/useShowData';
import { TvShowSeoData } from '@/components/tvShows/TvShowSeoData';
import { TvShowContent } from '@/components/tvShows/TvShowContent';

const TvShowDetails = () => {
  const { id, slug } = useParams<{ id: string, slug?: string }>();
  const { amazonAffiliateId = '' } = useAdminSettings?.() || {};
  const { show, isLoading, cast, similarShows } = useShowData(id, slug);

  if (isLoading) {
    return (
      <MainLayout>
        <MovieLoadingState />
      </MainLayout>
    );
  }

  if (!show) {
    return (
      <MainLayout>
        <MovieErrorState />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TvShowSeoData show={show} />
      <TvShowContent show={show} cast={cast} amazonAffiliateId={amazonAffiliateId} />
      {similarShows.length > 0 && <SimilarMovies movies={similarShows} />}
    </MainLayout>
  );
};

export default TvShowDetails;
