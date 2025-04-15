
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Genre } from '@/lib/api';
import { getRecommendationByFilters } from '@/lib/filterApi';

interface GenreGridProps {
  genres: Genre[];
}

const GenreGrid = ({ genres }: GenreGridProps) => {
  const navigate = useNavigate();

  const handleGenreClick = async (genreId: number, genreName: string) => {
    try {
      // Get movies for this genre directly and pass to the Genres page state
      const results = await getRecommendationByFilters({
        genres: [genreId],
        mediaType: 'movie'
      });
      
      // Navigate to Genres page with pre-selected genre
      navigate('/discover', { 
        state: { 
          selectedGenre: genreId,
          genreName: genreName,
          preloadedMovies: results
        } 
      });
    } catch (error) {
      console.error('Error fetching genre content:', error);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Genres</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <Card 
            key={genre.id}
            className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
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
