
import { Shuffle } from 'lucide-react';
import { MovieOrShow, CustomList } from '@/lib/api';
import MovieList from './MovieList';
import CustomListCarousel from '../movies/CustomListCarousel';

interface RandomListsProps {
  sciFiMovies: MovieOrShow[];
  romanceMovies: MovieOrShow[];
  actionMovies: MovieOrShow[];
  documentaryMovies: MovieOrShow[];
  customLists: CustomList[];
}

const RandomLists = ({ 
  sciFiMovies, 
  romanceMovies, 
  actionMovies, 
  documentaryMovies,
  customLists 
}: RandomListsProps) => {
  // Nur Listen mit Filmen berücksichtigen
  const listsWithMovies = customLists.filter(list => list.movies.length > 0);
  
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Shuffle className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Zufällige Listen</h2>
      </div>
      
      {listsWithMovies.length > 0 ? (
        <div>
          {listsWithMovies.map((list) => (
            <CustomListCarousel key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <>
          <MovieList title="Sci-Fi Klassiker" movies={sciFiMovies} />
          <MovieList title="Liebesfilme" movies={romanceMovies} />
          <MovieList title="Action Blockbuster" movies={actionMovies} />
          <MovieList title="Dokumentarfilme" movies={documentaryMovies} />
        </>
      )}
    </section>
  );
};

export default RandomLists;
