
import { CustomList, MovieOrShow } from './types';
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseMovieToMovieObject } from './movieApi';
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
      // For truly random lists, we use Postgres's random() function
      query = query.order('created_at', { ascending: false }).limit(20);
    } else {
      // For newest lists, we sort by creation date
      query = query.order('created_at', { ascending: false }).limit(count);
    }
    
    let { data, error } = await query;
      
    if (error) {
      console.error('Error getting custom lists from Supabase:', error);
      return [];
    }
    
    // If random is true, shuffle the results and take the requested count
    if (random && data && data.length > 0) {
      // Fisher-Yates shuffle algorithm
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }
      // Take only the requested count
      data = data.slice(0, count);
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

export const addMovieToList = async (listId: string, movie: MovieOrShow): Promise<CustomList> => {
  // First check if the movie is imported
  const { data: importedMovie, error: importCheckError } = await supabase
    .from('admin_movies')
    .select('*')
    .eq('id', movie.id)
    .maybeSingle();
  
  if (importCheckError) {
    console.error('Error checking if movie is imported:', importCheckError);
    throw new Error('Error checking if movie is imported');
  }
  
  if (!importedMovie) {
    throw new Error('Movie must be imported before adding to a list');
  }
  
  // Get the current list
  const { data: list, error: getListError } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', listId)
    .single();
  
  if (getListError) {
    console.error('Error getting list:', getListError);
    throw new Error('Error getting list');
  }
  
  // Check if movie already exists in the list
  const movies = Array.isArray(list.movies) ? list.movies : [];
  const movieExists = movies.some((m: any) => m.id === movie.id);
  
  if (movieExists) {
    return mapSupabaseListToCustomList(list as SupabaseCustomList);
  }
  
  // Add the movie to the list
  // We need to explicitly cast the movie as Json to ensure type compatibility
  const updatedMovies = [...movies, movie as unknown as Json];
  
  // Update the list
  const { data: updatedList, error: updateError } = await supabase
    .from('custom_lists')
    .update({ 
      movies: updatedMovies as Json, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', listId)
    .select('*')
    .single();
  
  if (updateError) {
    console.error('Error updating list:', updateError);
    throw new Error('Error updating list');
  }
  
  return mapSupabaseListToCustomList(updatedList as SupabaseCustomList);
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
    
    // Ensure movies is an array before filtering
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
