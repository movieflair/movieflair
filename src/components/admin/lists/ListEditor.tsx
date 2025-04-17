
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { CustomList, MovieOrShow } from '@/lib/types';
import { getCustomLists, createCustomList, updateCustomList, deleteCustomList, addMovieToList, removeMovieFromList } from '@/lib/customListApi';
import ListSidebar from './ListSidebar';
import ListContent from './ListContent';
import MediaSearch from './MediaSearch';
import ListCreationDialog from './ListCreationDialog';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ListEditor = () => {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [listDescription, setListDescription] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      setListTitle(selectedList.title);
      setListDescription(selectedList.description || '');
    }
  }, [selectedList]);

  const loadLists = async () => {
    try {
      setIsLoading(true);
      const fetchedLists = await getCustomLists();
      setLists(fetchedLists);
      
      if (fetchedLists.length > 0 && !selectedList) {
        setSelectedList(fetchedLists[0]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      toast.error('Listen konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (title: string, description: string) => {
    try {
      const newList = await createCustomList(title, description);
      
      setLists(prev => [...prev, newList]);
      setSelectedList(newList);
      setIsCreatingList(false);
      
      toast.success('Liste erstellt');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Liste konnte nicht erstellt werden');
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteCustomList(listId);
      
      setLists(prev => prev.filter(list => list.id !== listId));
      
      if (selectedList?.id === listId) {
        setSelectedList(lists.length > 1 ? lists.find(list => list.id !== listId) || null : null);
      }
      
      toast.success('Liste gelöscht');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Liste konnte nicht gelöscht werden');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedList) return;
    
    try {
      const updatedList = await updateCustomList({
        ...selectedList,
        title: listTitle,
        description: listDescription
      });
      
      setLists(prev => prev.map(list => list.id === updatedList.id ? updatedList : list));
      setSelectedList(updatedList);
      setIsEditing(false);
      
      toast.success('Liste aktualisiert');
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Liste konnte nicht aktualisiert werden');
    }
  };

  const handleCancel = () => {
    if (selectedList) {
      setListTitle(selectedList.title);
      setListDescription(selectedList.description || '');
    }
    setIsEditing(false);
  };

  const handleAddMedia = async (media: MovieOrShow) => {
    if (!selectedList) return;
    
    try {
      console.log('Adding media to list:', media);
      const updatedList = await addMovieToList(selectedList.id, media);
      
      setLists(prev => prev.map(list => list.id === updatedList.id ? updatedList : list));
      setSelectedList(updatedList);
      
      toast.success(`"${media.title || media.name}" zur Liste hinzugefügt`);
    } catch (error) {
      console.error('Error adding media to list:', error);
      toast.error('Medium konnte nicht zur Liste hinzugefügt werden');
    }
  };

  const handleRemoveMedia = async (mediaId: number) => {
    if (!selectedList) return;
    
    try {
      const updatedList = await removeMovieFromList(selectedList.id, mediaId);
      
      setLists(prev => prev.map(list => list.id === updatedList.id ? updatedList : list));
      setSelectedList(updatedList);
      
      toast.success('Medium von der Liste entfernt');
    } catch (error) {
      console.error('Error removing media from list:', error);
      toast.error('Medium konnte nicht von der Liste entfernt werden');
    }
  };

  // Get existing media IDs to prevent adding duplicates
  const existingMediaIds = selectedList?.movies.map(movie => movie.id) || [];

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Listen verwalten</h2>
        <Button onClick={() => setIsCreatingList(true)} className="flex items-center gap-1">
          <Plus size={16} />
          Neue Liste
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center">Lade Listen...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6">
          <div className="border rounded-lg overflow-hidden">
            <ListSidebar 
              lists={lists}
              selectedList={selectedList}
              onSelectList={setSelectedList}
              onDeleteList={handleDeleteList}
            />
          </div>
          
          <div>
            {selectedList ? (
              <div className="space-y-8">
                <ListContent 
                  list={selectedList}
                  isEditing={isEditing}
                  listTitle={listTitle}
                  listDescription={listDescription}
                  onTitleChange={setListTitle}
                  onDescriptionChange={setListDescription}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onRemoveMovie={handleRemoveMedia}
                />
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Inhalte hinzufügen</h3>
                  <MediaSearch 
                    onAddMedia={handleAddMedia}
                    selectedListId={selectedList.id}
                    existingMediaIds={existingMediaIds}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Keine Liste ausgewählt</p>
                <p className="text-sm">Wähle eine Liste aus oder erstelle eine neue</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <ListCreationDialog 
        isOpen={isCreatingList}
        onClose={() => setIsCreatingList(false)}
        onCreateList={handleCreateList}
      />
    </div>
  );
};

export default ListEditor;
