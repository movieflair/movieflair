
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createCustomList } from '@/lib/customListApi';
import { toast } from "sonner";

interface ListCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: () => void;
}

const ListCreationDialog = ({ isOpen, onClose, onListCreated }: ListCreationDialogProps) => {
  const [listTitle, setListTitle] = React.useState('');
  const [listDescription, setListDescription] = React.useState('');

  const handleCreateList = () => {
    if (!listTitle.trim()) {
      toast.error('Bitte gib einen Titel für die Liste ein');
      return;
    }
    
    createCustomList(listTitle.trim(), listDescription.trim());
    toast.success('Liste erfolgreich erstellt');
    
    setListTitle('');
    setListDescription('');
    onClose();
    onListCreated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Liste erstellen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="list-title" className="text-sm font-medium">Titel</label>
            <Input
              id="list-title"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="z.B. Meine Lieblingsfilme"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="list-description" className="text-sm font-medium">Beschreibung</label>
            <Textarea
              id="list-description"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Beschreibe deine Liste"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleCreateList}>Liste erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListCreationDialog;
