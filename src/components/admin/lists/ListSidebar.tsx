
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { CustomList } from '@/lib/api';

interface ListSidebarProps {
  lists: CustomList[];
  selectedList: CustomList | null;
  onSelectList: (list: CustomList) => void;
  onDeleteList: (listId: string) => void;
}

const ListSidebar = ({ lists, selectedList, onSelectList, onDeleteList }: ListSidebarProps) => {
  return (
    <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
      {lists.length > 0 ? (
        lists.map(list => (
          <div 
            key={list.id}
            className={`p-3 rounded-md cursor-pointer flex justify-between ${selectedList?.id === list.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'}`}
            onClick={() => onSelectList(list)}
          >
            <div>
              <h4 className="font-medium">{list.title}</h4>
              <p className="text-xs text-muted-foreground">{list.movies.length} Inhalte</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive/80"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteList(list.id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Film className="mx-auto h-12 w-12 opacity-20 mb-2" />
          <p>Keine Listen vorhanden</p>
          <p className="text-sm">Erstelle deine erste Liste</p>
        </div>
      )}
    </div>
  );
};

export default ListSidebar;
