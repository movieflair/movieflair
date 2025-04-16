
import { CustomList, MovieOrShow } from './types';
import { supabase } from '@/integrations/supabase/client';

export const getCustomLists = async (): Promise<CustomList[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*')
      .order('created_at', { ascending: false });
      
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

export const createCustomList = async (title: string, description: string): Promise<CustomList | null> => {
  const newList = {
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

export const updateCustomList = async (list: CustomList): Promise<CustomList | null> => {
  const { data, error } = await supabase
    .from('custom_lists')
    .update({
      ...list,
      updatedAt: new Date().toISOString()
    })
    .eq('id', list.id)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error updating custom list in Supabase:', error);
    return null;
  }
  
  return data;
};

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

export const addMovieToList = async (listId: string, media: MovieOrShow): Promise<CustomList | null> => {
  const { data: currentList, error: fetchError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .maybeSingle();
  
  if (fetchError || !currentList) {
    console.error('Error fetching list to add movie:', fetchError);
    return null;
  }
  
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
      .maybeSingle();
    
    if (error) {
      console.error('Error adding movie to list in Supabase:', error);
      return null;
    }
    
    return data;
  }
  
  return currentList;
};

export const removeMovieFromList = async (listId: string, mediaId: number): Promise<CustomList | null> => {
  const { data: currentList, error: fetchError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .maybeSingle();
  
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
    .maybeSingle();
  
  if (error) {
    console.error('Error removing movie from list in Supabase:', error);
    return null;
  }
  
  return data;
};
