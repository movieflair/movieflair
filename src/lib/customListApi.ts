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

export const getCustomList = async (id: string): Promise<CustomList> => {
  console.log(`Fetching custom list with ID: ${id}`);
  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error getting custom list from Supabase:', error);
      throw error;
    }
    
    console.log('Custom list fetched successfully:', data);
    
    return mapSupabaseListToCustomList({
      ...data,
      movies: data.movies
    } as SupabaseCustomList);
  } catch (error) {
    console.error('Error getting custom list:', error);
    throw error;
  }
};

export const getRandomCustomLists = async (count: number = 2, random: boolean = false): Promise<CustomList[]> => {
  console.log(`Fetching ${count} ${random ? 'random' : 'newest'} custom lists...`);
  try {
    let query = supabase
      .from('custom_lists')
      .select('*');
      
    if (random) {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query.limit(count);
      
    if (error) {
      console.error('Error getting custom lists from Supabase:', error);
      return [];
    }
    
    const lists = (data || []).map((item: SupabaseCustomList) => 
      mapSupabaseListToCustomList({
        ...item,
        movies: item.movies
      })
    );
    
    console.log(`Found ${lists.length} lists`);
    
    return lists;
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
  try {
    console.log('Adding movie to list:', listId, media);
    
    const { data: currentList, error: fetchError } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('id', listId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching list to add movie:', fetchError);
      throw fetchError;
    }
    
    if (!currentList) {
      throw new Error(`List with ID ${listId} not found`);
    }
    
    const mediaToAdd = {
      ...media,
      media_type: media.media_type || 'movie'
    };
    
    console.log('Current movies in list:', currentList.movies);
    
    const currentMovies = Array.isArray(currentList.movies) ? currentList.movies : [];
    
    const movieExists = currentMovies.some((m: any) => m.id === mediaToAdd.id);
    
    if (movieExists) {
      console.log('Movie already exists in list:', mediaToAdd.id);
      return mapSupabaseListToCustomList(currentList as SupabaseCustomList);
    }
    
    console.log('Adding movie to list:', mediaToAdd);
    const updatedMovies = [...currentMovies, mediaToAdd] as unknown as Json;
    
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
    
    console.log('Movie added successfully:', mediaToAdd.id);
    return mapSupabaseListToCustomList(data as SupabaseCustomList);
  } catch (error) {
    console.error('Error in addMovieToList:', error);
    throw error;
  }
};

export const removeMovieFromList = async (listId: string, mediaId: number): Promise<CustomList> => {
  try {
    console.log('Removing movie from list:', listId, mediaId);
    
    const { data: currentList, error: fetchError } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('id', listId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching list to remove movie:', fetchError);
      throw fetchError;
    }
    
    if (!currentList) {
      throw new Error(`List with ID ${listId} not found`);
    }
    
    console.log('Current movies in list:', currentList.movies);
    
    const currentMovies = Array.isArray(currentList.movies) ? currentList.movies : [];
    
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
    
    console.log('Movie removed successfully:', mediaId);
    return mapSupabaseListToCustomList(data as SupabaseCustomList);
  } catch (error) {
    console.error('Error in removeMovieFromList:', error);
    throw error;
  }
};
