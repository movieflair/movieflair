
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
  const [allResults, setAllResults] = useState<MovieOrShow[]>([]);

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
      setAllResults(results);
      
      if (results.length === 0) {
        toast.error('Keine passenden Filme gefunden. Bitte versuche andere Filter.');
        setRecommendation(null);
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        setRecommendation(results[randomIndex]);
        console.log('Selected recommendation:', results[randomIndex]);
        
        // Überprüfe für Debug-Zwecke, ob das Jahrzehnt korrekt ist
        if (currentFilter.decades.length > 0 && results[randomIndex].release_date) {
          const decade = parseInt(currentFilter.decades[0]);
          const releaseYear = parseInt(results[randomIndex].release_date.split('-')[0]);
          console.log(`Film Release: ${releaseYear}, Selected Decade: ${decade}-${decade+9}`);
          
          if (releaseYear < decade || releaseYear > decade + 9) {
            console.error('WARNING: Film year does not match selected decade!');
          }
        }
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
    
    // Wenn wir bereits Ergebnisse haben, verwenden wir diese, um einen neuen Film auszuwählen
    if (allResults.length > 1) {
      setIsLoading(true);
      try {
        // Finde einen anderen Film aus den vorhandenen Ergebnissen
        let newIndex;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
          newIndex = Math.floor(Math.random() * allResults.length);
          attempts++;
        } while (
          recommendation && 
          allResults[newIndex].id === recommendation.id && 
          attempts < maxAttempts
        );
        
        setRecommendation(allResults[newIndex]);
        toast.success('Neuer Filmvorschlag generiert!');
      } catch (error) {
        console.error('Error refreshing recommendation:', error);
        toast.error('Fehler beim Aktualisieren des Vorschlags.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Wenn keine oder zu wenige Ergebnisse vorhanden sind, führe eine neue Suche durch
      setIsLoading(true);
      try {
        const results = await getRecommendationByFilters({...lastUsedFilter});
        setAllResults(results);
        
        if (results.length === 0) {
          toast.error('Keine weiteren passenden Filme gefunden.');
        } else {
          const randomIndex = Math.floor(Math.random() * results.length);
          setRecommendation(results[randomIndex]);
          toast.success('Neuer Filmvorschlag generiert!');
        }
      } catch (error) {
        console.error('Error refreshing recommendation:', error);
        toast.error('Fehler beim Aktualisieren des Vorschlags.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    recommendation,
    handleSearch,
    handleRefreshRecommendation
  };
};
