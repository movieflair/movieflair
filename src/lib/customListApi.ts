
import { CustomList, MovieOrShow } from './types';

// Benutzerdefinierte Listen aus dem localStorage abrufen
export const getCustomLists = (): CustomList[] => {
  try {
    const listsJson = localStorage.getItem('customLists');
    if (!listsJson) return [];
    return JSON.parse(listsJson);
  } catch (error) {
    console.error('Error getting custom lists:', error);
    return [];
  }
};

// Eine neue benutzerdefinierte Liste erstellen
export const createCustomList = (title: string, description: string): CustomList => {
  const lists = getCustomLists();
  
  const newList: CustomList = {
    id: Date.now().toString(),
    title,
    description,
    movies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  lists.push(newList);
  localStorage.setItem('customLists', JSON.stringify(lists));
  
  return newList;
};

// Eine benutzerdefinierte Liste aktualisieren
export const updateCustomList = (updatedList: CustomList): CustomList => {
  const lists = getCustomLists();
  
  const index = lists.findIndex(list => list.id === updatedList.id);
  
  if (index >= 0) {
    updatedList.updatedAt = new Date().toISOString();
    lists[index] = updatedList;
    localStorage.setItem('customLists', JSON.stringify(lists));
  }
  
  return updatedList;
};

// Film oder Serie zu einer benutzerdefinierten Liste hinzufügen
export const addMovieToList = (listId: string, media: MovieOrShow): CustomList | null => {
  const lists = getCustomLists();
  
  const listIndex = lists.findIndex(list => list.id === listId);
  
  if (listIndex >= 0) {
    // Überprüfen, ob der Film oder die Serie bereits in der Liste ist
    const mediaExists = lists[listIndex].movies.some(m => m.id === media.id);
    
    if (!mediaExists) {
      lists[listIndex].movies.push(media);
      lists[listIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('customLists', JSON.stringify(lists));
    }
    
    return lists[listIndex];
  }
  
  return null;
};

// Film oder Serie aus einer benutzerdefinierten Liste entfernen
export const removeMovieFromList = (listId: string, mediaId: number): CustomList | null => {
  const lists = getCustomLists();
  
  const listIndex = lists.findIndex(list => list.id === listId);
  
  if (listIndex >= 0) {
    lists[listIndex].movies = lists[listIndex].movies.filter(media => media.id !== mediaId);
    lists[listIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('customLists', JSON.stringify(lists));
    
    return lists[listIndex];
  }
  
  return null;
};

// Eine benutzerdefinierte Liste löschen
export const deleteCustomList = (listId: string): boolean => {
  const lists = getCustomLists();
  
  const filteredLists = lists.filter(list => list.id !== listId);
  
  if (filteredLists.length !== lists.length) {
    localStorage.setItem('customLists', JSON.stringify(filteredLists));
    return true;
  }
  
  return false;
};

// Zufällige Listen für die Anzeige abrufen
export const getRandomCustomLists = (limit = 3): CustomList[] => {
  const lists = getCustomLists();
  
  // Nur Listen mit mindestens einem Film zurückgeben
  const listsWithMovies = lists.filter(list => list.movies.length > 0);
  
  if (listsWithMovies.length <= limit) {
    return listsWithMovies;
  }
  
  // Zufällige Auswahl der Listen
  const shuffled = [...listsWithMovies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};
