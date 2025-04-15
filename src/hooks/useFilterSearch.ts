
import { useState } from 'react';
import { toast } from 'sonner';
import { MovieOrShow } from '@/lib/types';
import { getRecommendationByFilters } from '@/lib/filterApi';

interface FilterState {
  moods: string[];
  genres: number[];
  decades: string[];
  rating: number;
  mediaType: 'movie';
}

export const useFilterSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<MovieOrShow | null>(null);
  const [lastUsedFilter, setLastUsedFilter] = useState<FilterState | null>(null);

  const handleSearch = async (currentFilter: FilterState) => {
    if (currentFilter.moods.length === 0 && 
        currentFilter.genres.length === 0 && 
        currentFilter.decades.length === 0) {
      toast.warning('Bitte wähle mindestens einen Filter aus (Stimmung, Genre oder Jahrzehnt)');
      return;
    }
    
    setIsLoading(true);
    setLastUsedFilter(currentFilter);
    
    try {
      const results = await getRecommendationByFilters(currentFilter);
      
      if (results.length === 0) {
        toast.error('Keine passenden Filme gefunden. Bitte versuche andere Filter.');
        setRecommendation(null);
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        setRecommendation(results[randomIndex]);
        console.log('Selected recommendation:', results[randomIndex]);
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      toast.error('Fehler bei der Suche. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRecommendation = async () => {
    if (!lastUsedFilter) return;
    setIsLoading(true);
    
    try {
      const results = await getRecommendationByFilters({...lastUsedFilter});
      
      if (results.length === 0) {
        toast.error('Keine weiteren passenden Filme gefunden.');
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        const newRecommendation = results[randomIndex];
        
        if (recommendation && newRecommendation.id === recommendation.id && results.length > 1) {
          const newIndex = (randomIndex + 1) % results.length;
          setRecommendation(results[newIndex]);
        } else {
          setRecommendation(newRecommendation);
        }
        
        toast.success('Neuer Filmvorschlag generiert!');
      }
    } catch (error) {
      console.error('Error refreshing recommendation:', error);
      toast.error('Fehler beim Aktualisieren des Vorschlags.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    recommendation,
    handleSearch,
    handleRefreshRecommendation
  };
};
