
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCustomList } from '@/lib/customListApi';
import { toast } from "sonner";

interface ListCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: () => void;
}

const ListCreationDialog: React.FC<ListCreationDialogProps> = ({ isOpen, onClose, onListCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateList = () => {
    if (!title.trim()) {
      toast.error('Bitte gib einen Titel für die Liste ein');
      return;
    }
    
    setIsCreating(true);
    
    try {
      createCustomList(title.trim(), description.trim());
      toast.success('Liste erfolgreich erstellt');
      
      onListCreated();
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Fehler beim Erstellen der Liste:', error);
      toast.error('Fehler beim Erstellen der Liste');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Liste erstellen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Titel</label>
            <Input
              id="title"
              placeholder="Titel der Liste"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Beschreibung (optional)</label>
            <Textarea
              id="description"
              placeholder="Beschreibung der Liste"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Abbrechen
          </Button>
          <Button onClick={handleCreateList} disabled={isCreating}>
            {isCreating ? 'Erstelle...' : 'Liste erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListCreationDialog;
