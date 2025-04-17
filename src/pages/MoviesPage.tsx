
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieList from '@/components/movies/MovieList';
import MovieGrid from '@/components/movies/MovieGrid';
import MovieTableView from '@/components/movies/MovieTableView';
import MovieFilterBar from '@/components/movies/MovieFilterBar';
import { Film, Grid, List, Table } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getImportedMovies } from '@/lib/api';

const VIEWS = {
  LIST: 'list',
  GRID: 'grid',
  TABLE: 'table'
};

const MoviesPage = () => {
  const [view, setView] = useState(VIEWS.GRID);
  const [filter, setFilter] = useState('');
  
  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['importedMovies'],
    queryFn: () => getImportedMovies(), // Remove the parameter as it's not accepted
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  if (error) {
    toast.error('Fehler beim Laden der Filme');
  }
  
  const filteredMovies = filter 
    ? movies.filter(movie => 
        movie.title?.toLowerCase().includes(filter.toLowerCase()) ||
        movie.release_date?.includes(filter)
      )
    : movies;
    
  const renderMovieView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (filteredMovies.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Film size={48} className="mb-4" />
          <p>{filter ? `Keine Filme gefunden für "${filter}"` : 'Keine Filme in der Bibliothek'}</p>
        </div>
      );
    }
    
    switch (view) {
      case VIEWS.LIST:
        return <MovieList movies={filteredMovies} />;
      case VIEWS.TABLE:
        return <MovieTableView movies={filteredMovies} />;
      case VIEWS.GRID:
      default:
        return <MovieGrid movies={filteredMovies} />;
    }
  };
  
  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Filme</h1>
              <p className="text-gray-600">
                Entdecke alle Filme in unserer Sammlung
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs 
                value={view} 
                onValueChange={setView}
                className="border rounded-lg p-1"
              >
                <TabsList className="grid grid-cols-3 w-[200px]">
                  <TabsTrigger value={VIEWS.GRID} className="flex items-center gap-1">
                    <Grid size={16} /> Grid
                  </TabsTrigger>
                  <TabsTrigger value={VIEWS.LIST} className="flex items-center gap-1">
                    <List size={16} /> Liste
                  </TabsTrigger>
                  <TabsTrigger value={VIEWS.TABLE} className="flex items-center gap-1">
                    <Table size={16} /> Tabelle
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <MovieFilterBar 
            onFilterChange={setFilter} 
            totalMovies={movies.length}
            filteredMovies={filteredMovies.length}
          />
          
          <div className="mt-6">
            {renderMovieView()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MoviesPage;
