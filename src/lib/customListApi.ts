
import { CustomList, MovieOrShow } from './types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface SupabaseCustomList {
  id: string;
  title: string;
  description: string;
  movies: Json;
  created_at: string;
  updated_at: string;
  createdat: string;
  updatedat: string;
}

const mapSupabaseListToCustomList = (list: SupabaseCustomList): CustomList => ({
  id: list.id,
  title: list.title,
  description: list.description,
  // Properly cast the JSON data to MovieOrShow[] with a type assertion
  movies: Array.isArray(list.movies) ? (list.movies as unknown as MovieOrShow[]) : [],
  createdAt: list.created_at || list.createdat,
  updatedAt: list.updated_at || list.updatedat
});

export const getCustomLists = async (): Promise<CustomList[]> => {
  try {
    console.log('Fetching custom lists from Supabase...');
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting custom lists from Supabase:', error);
      return [];
    }
    
    console.log('Custom lists fetched successfully:', data?.length || 0);
    
    return (data || []).map((item: SupabaseCustomList) => mapSupabaseListToCustomList({
      ...item,
      movies: item.movies
    }));
  } catch (error) {
    console.error('Error getting custom lists:', error);
    return [];
  }
};

// Function to get random custom lists
export const getRandomCustomLists = async (count: number = 2): Promise<CustomList[]> => {
  console.log(`Fetching ${count} random custom lists...`);
  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting random custom lists from Supabase:', error);
      return [];
    }
    
    const lists = (data || []).map((item: SupabaseCustomList) => 
      mapSupabaseListToCustomList({
        ...item,
        movies: item.movies
      })
    );
    
    // Filter lists that have movies
    const listsWithMovies = lists.filter(list => Array.isArray(list.movies) && list.movies.length > 0);
    console.log(`Found ${listsWithMovies.length} lists with movies`);
    
    // If we don't have enough lists, return all we have
    if (listsWithMovies.length <= count) {
      return listsWithMovies;
    }
    
    // Shuffle the lists and take the requested count
    const shuffled = [...listsWithMovies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error getting random custom lists:', error);
    return [];
  }
};

export const createCustomList = async (title: string, description: string): Promise<CustomList> => {
  const newList = {
    title,
    description,
    movies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('custom_lists')
    .insert(newList)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating custom list in Supabase:', error);
    throw error;
  }
  
  return mapSupabaseListToCustomList(data as SupabaseCustomList);
};

export const updateCustomList = async (list: CustomList): Promise<CustomList> => {
  const supabaseList = {
    id: list.id,
    title: list.title,
    description: list.description,
    // Cast MovieOrShow[] to Json with a type assertion
    movies: list.movies as unknown as Json,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('custom_lists')
    .update(supabaseList)
    .eq('id', list.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating custom list in Supabase:', error);
    throw error;
  }
  
  return mapSupabaseListToCustomList(data as SupabaseCustomList);
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

export const addMovieToList = async (listId: string, media: MovieOrShow): Promise<CustomList> => {
  const { data: currentList, error: fetchError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .single();
  
  if (fetchError || !currentList) {
    console.error('Error fetching list to add movie:', fetchError);
    throw fetchError;
  }
  
  const currentMovies = Array.isArray(currentList.movies) ? currentList.movies : [];
  const movieExists = currentMovies.some((m: any) => m.id === media.id);
  
  if (!movieExists) {
    // Properly cast the array to Json with a type assertion
    const updatedMovies = [...currentMovies, media] as unknown as Json;
    
    const { data, error } = await supabase
      .from('custom_lists')
      .update({ 
        movies: updatedMovies,
        updated_at: new Date().toISOString()
      })
      .eq('id', listId)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding movie to list in Supabase:', error);
      throw error;
    }
    
    return mapSupabaseListToCustomList(data as SupabaseCustomList);
  }
  
  return mapSupabaseListToCustomList(currentList as SupabaseCustomList);
};

export const removeMovieFromList = async (listId: string, mediaId: number): Promise<CustomList> => {
  const { data: currentList, error: fetchError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .single();
  
  if (fetchError || !currentList) {
    console.error('Error fetching list to remove movie:', fetchError);
    throw fetchError;
  }
  
  const currentMovies = Array.isArray(currentList.movies) ? currentList.movies : [];
  // Use proper type casting for the filtered movies
  const updatedMovies = currentMovies.filter((media: any) => media.id !== mediaId) as unknown as Json;
  
  const { data, error } = await supabase
    .from('custom_lists')
    .update({ 
      movies: updatedMovies,
      updated_at: new Date().toISOString()
    })
    .eq('id', listId)
    .select()
    .single();
  
  if (error) {
    console.error('Error removing movie from list in Supabase:', error);
    throw error;
  }
  
  return mapSupabaseListToCustomList(data as SupabaseCustomList);
};
