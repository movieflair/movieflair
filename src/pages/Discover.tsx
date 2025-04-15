
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Command, CommandInput } from '@/components/ui/command';
import MovieCard from '@/components/movies/MovieCard';
import { 
  Genre, 
  getGenres, 
  getPopularMovies,
  getPopularTvShows,
  MovieOrShow,
  getRecommendationByFilters 
} from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Shuffle, Film, TrendingUp } from 'lucide-react';

const Discover = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieOrShow[]>([]);
  const [popularShows, setPopularShows] = useState<MovieOrShow[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MovieOrShow[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<MovieOrShow[]>([]);
  const [actionMovies, setActionMovies] = useState<MovieOrShow[]>([]);
  const [documentaryMovies, setDocumentaryMovies] = useState<MovieOrShow[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [genresList, movies, shows] = await Promise.all([
          getGenres(),
          getPopularMovies(),
          getPopularTvShows()
        ]);
        setGenres(genresList);
        setPopularMovies(movies.slice(0, 4));
        setPopularShows(shows.slice(0, 4));

        // Fetch movies for each list category
        const sciFi = await getRecommendationByFilters({ genres: [878], mediaType: 'movie' });
        const romance = await getRecommendationByFilters({ genres: [10749], mediaType: 'movie' });
        const action = await getRecommendationByFilters({ genres: [28], mediaType: 'movie' });
        const documentary = await getRecommendationByFilters({ genres: [99], mediaType: 'movie' });

        setSciFiMovies(sciFi.slice(0, 4));
        setRomanceMovies(romance.slice(0, 4));
        setActionMovies(action.slice(0, 4));
        setDocumentaryMovies(documentary.slice(0, 4));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleGenreClick = (genreId: number) => {
    navigate(`/search?genre=${genreId}`);
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto mb-12">
          {/* Search Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold mb-6">Entdecke neue Filme und Serien</h1>
            <Command className="border-none shadow-lg">
              <CommandInput 
                placeholder="Suche nach Filmen, Serien oder Kategorien..." 
                value={searchQuery}
                onValueChange={handleSearch}
                className="h-12"
              />
            </Command>
          </div>

          {/* Genres Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {genres.map((genre) => (
                <Card 
                  key={genre.id}
                  className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => handleGenreClick(genre.id)}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium">{genre.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Movies */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Film className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-semibold">Trending Filme</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {popularMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>

          {/* Lists Sections */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Shuffle className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">Zufällige Listen</h2>
            </div>
            
            {/* Sci-Fi List */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Sci-Fi Klassiker</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sciFiMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
            
            {/* Romance List */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Liebesfilme</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {romanceMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
            
            {/* Action List */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Action Blockbuster</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {actionMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
            
            {/* Documentary List */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Dokumentarfilme</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {documentaryMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Discover;
