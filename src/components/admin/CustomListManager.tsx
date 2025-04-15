
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Film, Check, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { searchMovies, CustomList, MovieOrShow } from '@/lib/api';
import { getCustomLists, createCustomList, updateCustomList, addMovieToList, removeMovieFromList, deleteCustomList } from '@/lib/customListApi';
import { toast } from "sonner";

const CustomListManager = () => {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [editingList, setEditingList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieOrShow[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Liste der benutzerdefinierten Listen abrufen
  const { data: searchMoviesData, isLoading: isSearching, refetch } = useQuery({
    queryKey: ['search-movies-for-list', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: false,
  });

  // Listen laden
  useEffect(() => {
    loadLists();
  }, []);

  // Beobachten Sie Änderungen an den Suchergebnissen
  useEffect(() => {
    if (searchMoviesData) {
      setSearchResults(searchMoviesData);
    }
  }, [searchMoviesData]);

  const loadLists = () => {
    const customLists = getCustomLists();
    setLists(customLists);
  };

  const handleCreateList = () => {
    if (!listTitle.trim()) {
      toast.error('Bitte gib einen Titel für die Liste ein');
      return;
    }
    
    createCustomList(listTitle.trim(), listDescription.trim());
    toast.success('Liste erfolgreich erstellt');
    
    setListTitle('');
    setListDescription('');
    setIsCreatingList(false);
    loadLists();
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

  const handleSelectList = (list: CustomList) => {
    setSelectedList(list);
    setListTitle(list.title);
    setListDescription(list.description);
    setEditingList(false);
  };

  const handleEditList = () => {
    if (!selectedList) return;
    setEditingList(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      await refetch();
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMovie = (movie: MovieOrShow) => {
    if (!selectedList) return;
    
    addMovieToList(selectedList.id, movie);
    toast.success(`${movie.title || movie.name} zur Liste hinzugefügt`);
    
    loadLists();
    
    // Ausgewählte Liste aktualisieren
    const updatedList = getCustomLists().find(l => l.id === selectedList.id);
    if (updatedList) {
      setSelectedList(updatedList);
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    if (!selectedList) return;
    
    removeMovieFromList(selectedList.id, movieId);
    toast.success('Film aus der Liste entfernt');
    
    loadLists();
    
    // Ausgewählte Liste aktualisieren
    const updatedList = getCustomLists().find(l => l.id === selectedList.id);
    if (updatedList) {
      setSelectedList(updatedList);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Benutzerdefinierte Listen</h3>
          <Button 
            onClick={() => {
              setIsCreatingList(true);
              setListTitle('');
              setListDescription('');
            }}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Neue Liste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[250px,1fr] divide-x">
        {/* Listenübersicht */}
        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
          {lists.length > 0 ? (
            lists.map(list => (
              <div 
                key={list.id}
                className={`p-3 rounded-md cursor-pointer flex justify-between ${selectedList?.id === list.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'}`}
                onClick={() => handleSelectList(list)}
              >
                <div>
                  <h4 className="font-medium">{list.title}</h4>
                  <p className="text-xs text-muted-foreground">{list.movies.length} Filme</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id);
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

        {/* Listendetails und Suchfunktion */}
        <div className="p-4">
          {selectedList ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                {editingList ? (
                  <div className="space-y-3 w-full">
                    <Input
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      placeholder="Listentitel"
                      className="text-lg font-medium"
                    />
                    <Textarea
                      value={listDescription}
                      onChange={(e) => setListDescription(e.target.value)}
                      placeholder="Listenbeschreibung"
                      className="min-h-[100px]"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleUpdateList}
                        className="flex items-center gap-1"
                      >
                        <Save size={16} />
                        Speichern
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingList(false);
                          if (selectedList) {
                            setListTitle(selectedList.title);
                            setListDescription(selectedList.description);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        <X size={16} />
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{selectedList.title}</h2>
                      <p className="text-muted-foreground">{selectedList.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditList}
                      className="flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Bearbeiten
                    </Button>
                  </>
                )}
              </div>

              <div className="border-t border-b py-4">
                <h3 className="text-lg font-medium mb-4">Filme hinzufügen</h3>
                <form onSubmit={handleSearch} className="flex max-w-md mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nach Filmen suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="ml-2"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Suche...' : 'Suchen'}
                  </Button>
                </form>

                {searchResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                    {searchResults.map(movie => (
                      <div 
                        key={movie.id} 
                        className="flex items-center gap-3 p-2 border rounded-md hover:bg-muted/30"
                      >
                        <div className="h-12 w-8 bg-muted rounded overflow-hidden flex-shrink-0">
                          {movie.poster_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title || movie.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Film className="h-full w-full p-1 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium truncate">{movie.title || movie.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(movie.release_date || movie.first_air_date)?.substring(0, 4) || 'Unbekanntes Jahr'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-500"
                          onClick={() => handleAddMovie(movie)}
                          disabled={selectedList.movies.some(m => m.id === movie.id)}
                        >
                          {selectedList.movies.some(m => m.id === movie.id) ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Plus size={16} />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Filme in dieser Liste ({selectedList.movies.length})</h3>
                {selectedList.movies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedList.movies.map(movie => (
                      <div 
                        key={movie.id} 
                        className="relative group rounded-md overflow-hidden"
                      >
                        <div className="aspect-[2/3] bg-muted">
                          {movie.poster_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                              alt={movie.title || movie.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Film className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveMovie(movie.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Entfernen
                          </Button>
                        </div>
                        <p className="text-sm mt-1 truncate">{movie.title || movie.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Keine Filme in dieser Liste</p>
                    <p className="text-sm">Suche nach Filmen, um sie hinzuzufügen</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Film className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>Keine Liste ausgewählt</p>
              <p className="text-sm">Wähle eine Liste aus oder erstelle eine neue</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog zum Erstellen einer neuen Liste */}
      <Dialog open={isCreatingList} onOpenChange={setIsCreatingList}>
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
            <Button variant="outline" onClick={() => setIsCreatingList(false)}>Abbrechen</Button>
            <Button onClick={handleCreateList}>Liste erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomListManager;
