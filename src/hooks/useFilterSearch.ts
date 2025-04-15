
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
      console.log('Searching with filters:', currentFilter);
      const results = await getRecommendationByFilters(currentFilter);
      setAllResults(results);
      
      if (results.length === 0) {
        toast.error('Keine passenden Filme gefunden. Bitte versuche andere Filter.');
        setRecommendation(null);
        
        // Hilfestellung bei leeren Ergebnissen
        if (currentFilter.decades && currentFilter.decades.length > 0) {
          toast('Tipp: Versuche es mit weniger Filtern für ältere Jahrzehnte.', {
            duration: 5000
          });
        }
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        setRecommendation(results[randomIndex]);
        console.log('Selected recommendation:', results[randomIndex]);
        
        // Informationen für Debug-Zwecke
        console.log('All matching movies:', results.map(movie => ({
          title: movie.title,
          year: movie.release_date?.split('-')[0],
          id: movie.id
        })));
        
        toast.success(`${results.length} passende Filme gefunden!`);
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
    
    // Wenn bereits Ergebnisse vorhanden sind, daraus auswählen
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
      // Bei wenigen Ergebnissen neue Suche durchführen
      handleSearch(lastUsedFilter);
    }
  };

  return {
    isLoading,
    recommendation,
    handleSearch,
    handleRefreshRecommendation
  };
};
