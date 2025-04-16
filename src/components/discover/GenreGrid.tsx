
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Genre } from '@/lib/api';

interface GenreGridProps {
  genres: Genre[];
}

const GenreGrid = ({ genres }: GenreGridProps) => {
  const navigate = useNavigate();

  const handleGenreClick = (genreId: number, genreName: string) => {
    // Navigate directly to the genres page with the selected genre
    navigate('/genres', { 
      state: { 
        selectedGenre: genreId,
        genreName: genreName
      } 
    });
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Genres</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <Card 
            key={genre.id}
            className="cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors"
            onClick={() => handleGenreClick(genre.id, genre.name)}
          >
            <CardContent className="p-4 text-center">
              <h3 className="font-medium">{genre.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GenreGrid;
