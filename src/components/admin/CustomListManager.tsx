import { useState, useEffect } from 'react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CustomList } from '@/lib/types';
import { getCustomLists, createCustomList, updateCustomList, deleteCustomList } from '@/lib/customListApi';

const CustomListManager = () => {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomLists();
  }, []);

  const loadCustomLists = async () => {
    try {
      setIsLoading(true);
      const lists = await getCustomLists();
      setCustomLists(lists);
    } catch (error) {
      console.error('Error loading custom lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenListDialog = () => {
    setIsListDialogOpen(true);
  };

  const handleCloseListDialog = () => {
    setIsListDialogOpen(false);
    setNewListTitle('');
    setNewListDescription('');
  };

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleCreateList = async (title: string, description: string) => {
    try {
      const newList = await createCustomList(title, description);
      setCustomLists(prev => [...prev, newList]);
      setSelectedList(newList);
      setIsListDialogOpen(false);
    } catch (error) {
      console.error('Error creating custom list:', error);
      toast.error('Fehler beim Erstellen der Liste');
    }
  };

  const handleUpdateList = async (updatedList: CustomList) => {
    try {
      const savedList = await updateCustomList(updatedList);
      setCustomLists(prev => prev.map(list => 
        list.id === savedList.id ? savedList : list
      ));
      setSelectedList(savedList);
    } catch (error) {
      console.error('Error updating custom list:', error);
      toast.error('Fehler beim Aktualisieren der Liste');
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;
  
    try {
      const success = await deleteCustomList(selectedList.id);
      if (success) {
        setCustomLists(prev => prev.filter(list => list.id !== selectedList.id));
        setSelectedList(null);
        setIsDeleteDialogOpen(false);
        toast.success('Liste erfolgreich gelöscht');
      } else {
        toast.error('Fehler beim Löschen der Liste');
      }
    } catch (error) {
      console.error('Error deleting custom list:', error);
      toast.error('Fehler beim Löschen der Liste');
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Benutzerdefinierte Listen verwalten</h2>
        <Button onClick={handleOpenListDialog}>
          Neue Liste erstellen
        </Button>
      </div>

      <AlertDialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Neue Liste erstellen</AlertDialogTitle>
            <AlertDialogDescription>
              Geben Sie einen Titel und eine Beschreibung für die neue Liste ein.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titel
              </Label>
              <Input 
                id="title" 
                value={newListTitle} 
                onChange={(e) => setNewListTitle(e.target.value)} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Beschreibung
              </Label>
              <Input 
                id="description" 
                value={newListDescription} 
                onChange={(e) => setNewListDescription(e.target.value)} 
                className="col-span-3" 
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseListDialog}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCreateList(newListTitle, newListDescription)}>
              Liste erstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <p>Lade Listen...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customLists.map(list => (
            <Card 
              key={list.id} 
              className={`hover:bg-muted cursor-pointer ${selectedList?.id === list.id ? 'border-2 border-primary' : ''}`}
              onClick={() => setSelectedList(list)}
            >
              <CardHeader>
                <CardTitle>{list.title}</CardTitle>
                <CardDescription>{list.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Erstellt am: {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedList && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Liste bearbeiten</h3>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Titel
              </Label>
              <Input 
                id="edit-title" 
                value={selectedList.title} 
                onChange={(e) => handleUpdateList({ ...selectedList, title: e.target.value })} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Beschreibung
              </Label>
              <Input 
                id="edit-description" 
                value={selectedList.description} 
                onChange={(e) => handleUpdateList({ ...selectedList, description: e.target.value })} 
                className="col-span-3" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Liste löschen</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Möchten Sie die Liste wirklich löschen?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCloseDeleteDialog}>
                    Abbrechen
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteList}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomListManager;
