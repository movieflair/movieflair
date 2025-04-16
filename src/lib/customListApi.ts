
import { CustomList, MovieOrShow } from './types';
import { supabase } from '@/integrations/supabase/client';

// Benutzerdefinierte Listen aus Supabase abrufen
export const getCustomLists = async (): Promise<CustomList[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*');
      
    if (error) {
      console.error('Error getting custom lists from Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting custom lists:', error);
    return [];
  }
};

// Eine neue benutzerdefinierte Liste erstellen
export const createCustomList = async (title: string, description: string): Promise<CustomList | null> => {
  const newList: Omit<CustomList, 'id'> = {
    title,
    description,
    movies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('custom_lists')
    .insert(newList)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating custom list in Supabase:', error);
    return null;
  }
  
  return data;
};

// Eine benutzerdefinierte Liste aktualisieren
export const updateCustomList = async (updatedList: CustomList): Promise<CustomList | null> => {
  const listToUpdate = {
    ...updatedList,
    updatedAt: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('custom_lists')
    .update(listToUpdate)
    .eq('id', updatedList.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating custom list in Supabase:', error);
    return null;
  }
  
  return data;
};

// Film oder Serie zu einer benutzerdefinierten Liste hinzufügen
export const addMovieToList = async (listId: string, media: MovieOrShow): Promise<CustomList | null> => {
  // Erst die aktuelle Liste abrufen
  const { data: currentList, error: fetchError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .single();
  
  if (fetchError || !currentList) {
    console.error('Error fetching list to add movie:', fetchError);
    return null;
  }
  
  // Überprüfen, ob der Film oder die Serie bereits in der Liste ist
  const movieExists = currentList.movies.some((m: MovieOrShow) => m.id === media.id);
  
  if (!movieExists) {
    const updatedMovies = [...currentList.movies, media];
    
    const { data, error } = await supabase
      .from('custom_lists')
      .update({ 
        movies: updatedMovies,
        updatedAt: new Date().toISOString()
      })
      .eq('id', listId)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding movie to list in Supabase:', error);
      return null;
    }
    
    return data;
  }
  
  return currentList;
};

// Film oder Serie aus einer benutzerdefinierten Liste entfernen
export const removeMovieFromList = async (listId: string, mediaId: number): Promise<CustomList | null> => {
  // Erst die aktuelle Liste abrufen
  const { data: currentList, error: fetchError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .single();
  
  if (fetchError || !currentList) {
    console.error('Error fetching list to remove movie:', fetchError);
    return null;
  }
  
  const updatedMovies = currentList.movies.filter((media: MovieOrShow) => media.id !== mediaId);
  
  const { data, error } = await supabase
    .from('custom_lists')
    .update({ 
      movies: updatedMovies,
      updatedAt: new Date().toISOString()
    })
    .eq('id', listId)
    .select()
    .single();
  
  if (error) {
    console.error('Error removing movie from list in Supabase:', error);
    return null;
  }
  
  return data;
};

// Eine benutzerdefinierte Liste löschen
export const deleteCustomList = async (listId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('custom_lists')
    .delete()
    .eq('id', listId);
  
  if (error) {
    console.error('Error deleting custom list from Supabase:', error);
    return false;
  }
  
  return true;
};

// Zufällige Listen für die Anzeige abrufen
export const getRandomCustomLists = async (limit = 3): Promise<CustomList[]> => {
  const { data: lists, error } = await supabase
    .from('custom_lists')
    .select('*');
  
  if (error || !lists) {
    console.error('Error fetching random custom lists:', error);
    return [];
  }
  
  // Nur Listen mit mindestens einem Film zurückgeben
  const listsWithMovies = lists.filter(list => list.movies.length > 0);
  
  if (listsWithMovies.length <= limit) {
    return listsWithMovies;
  }
  
  // Zufällige Auswahl der Listen
  const shuffled = [...listsWithMovies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};
