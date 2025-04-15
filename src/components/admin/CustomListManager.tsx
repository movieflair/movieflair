
import { useState, useEffect } from 'react';
import { Film, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CustomList, MovieOrShow } from '@/lib/types';
import { getCustomLists, updateCustomList, addMovieToList, removeMovieFromList, deleteCustomList } from '@/lib/customListApi';
import { toast } from "sonner";
import ListCreationDialog from './lists/ListCreationDialog';
import ListSidebar from './lists/ListSidebar';
import MediaSearch from './lists/MediaSearch';
import ListContent from './lists/ListContent';

const CustomListManager = () => {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [editingList, setEditingList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [listDescription, setListDescription] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const customLists = getCustomLists();
    setLists(customLists);
  };

  const handleSelectList = (list: CustomList) => {
    setSelectedList(list);
    setListTitle(list.title);
    setListDescription(list.description);
    setEditingList(false);
  };

  const handleUpdateList = () => {
    if (!selectedList) return;
    if (!listTitle.trim()) {
      toast.error('Bitte gib einen Titel für die Liste ein');
      return;
    }
    
    const updatedList: CustomList = {
      ...selectedList,
      title: listTitle.trim(),
      description: listDescription.trim()
    };
    
    updateCustomList(updatedList);
    toast.success('Liste erfolgreich aktualisiert');
    
    setEditingList(false);
    loadLists();
    setSelectedList(updatedList);
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Möchtest du diese Liste wirklich löschen?')) {
      deleteCustomList(listId);
      toast.success('Liste erfolgreich gelöscht');
      
      loadLists();
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
    }
  };

  const handleAddMedia = (media: MovieOrShow) => {
    if (!selectedList) return;
    
    const updatedList = addMovieToList(selectedList.id, media);
    if (updatedList) {
      toast.success(`${media.title || media.name} zur Liste hinzugefügt`);
      loadLists();
      setSelectedList(updatedList);
    } else {
      toast.error('Fehler beim Hinzufügen des Inhalts');
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    if (!selectedList) return;
    
    const updatedList = removeMovieFromList(selectedList.id, movieId);
    if (updatedList) {
      toast.success('Inhalt aus der Liste entfernt');
      loadLists();
      setSelectedList(updatedList);
    } else {
      toast.error('Fehler beim Entfernen des Inhalts');
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Benutzerdefinierte Listen</h3>
          <Button 
            onClick={() => setIsCreatingList(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Neue Liste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[250px,1fr] divide-x">
        <ListSidebar
          lists={lists}
          selectedList={selectedList}
          onSelectList={handleSelectList}
          onDeleteList={handleDeleteList}
        />

        <div className="p-4">
          {selectedList ? (
            <>
              <MediaSearch
                onAddMedia={handleAddMedia}
                selectedListId={selectedList.id}
                existingMediaIds={selectedList.movies.map(m => m.id)}
              />
              <ListContent
                list={selectedList}
                isEditing={editingList}
                listTitle={listTitle}
                listDescription={listDescription}
                onTitleChange={setListTitle}
                onDescriptionChange={setListDescription}
                onEdit={() => setEditingList(true)}
                onSave={handleUpdateList}
                onCancel={() => {
                  setEditingList(false);
                  setListTitle(selectedList.title);
                  setListDescription(selectedList.description);
                }}
                onRemoveMovie={handleRemoveMovie}
              />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Film className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>Keine Liste ausgewählt</p>
              <p className="text-sm">Wähle eine Liste aus oder erstelle eine neue</p>
            </div>
          )}
        </div>
      </div>

      <ListCreationDialog
        isOpen={isCreatingList}
        onClose={() => setIsCreatingList(false)}
        onListCreated={loadLists}
      />
    </div>
  );
};

export default CustomListManager;
