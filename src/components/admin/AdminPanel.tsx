
import { useState } from 'react';
import { Search, FileEdit, Film, Tv, Tag, Video, PlayCircle, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminSettings } from '@/hooks/useAdminSettings';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    amazonAffiliateId, 
    setAmazonAffiliateId, 
    saveSettings 
  } = useAdminSettings();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="button-secondary"
        >
          Logout
        </button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="content">Inhalte</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'movies'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('movies')}
              >
                <Film className="w-4 h-4 mr-2" />
                Filme
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'shows'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('shows')}
              >
                <Tv className="w-4 h-4 mr-2" />
                Serien
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'free'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('free')}
              >
                <Video className="w-4 h-4 mr-2" />
                Kostenlose Filme
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'trailers'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('trailers')}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Neue Trailer
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'tags'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('tags')}
              >
                <Tag className="w-4 h-4 mr-2" />
                Tags
              </button>
            </div>

            <div className="p-4">
              <div className="flex max-w-md mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Suche ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button className="button-primary ml-2">
                  Suchen
                </button>
              </div>

              {/* Film Edit Form Preview */}
              {activeTab === 'movies' && (
                <div className="border border-border rounded-md p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4">Film bearbeiten</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title">Titel</Label>
                      <Input id="title" placeholder="Fight Club" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Jahr</Label>
                      <Input id="year" placeholder="1999" className="mt-1" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <textarea 
                        id="description"
                        rows={4}
                        className="w-full mt-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Film Beschreibung..."
                      />
                    </div>
                    
                    <div className="flex space-x-6 items-start">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasStream" />
                        <Label htmlFor="hasStream">Stream verfügbar</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasTrailer" />
                        <Label htmlFor="hasTrailer">Als Trailer anzeigen</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="streamUrl">Stream URL (Embed)</Label>
                      <Input id="streamUrl" placeholder="https://www.youtube.com/embed/..." className="mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button className="button-primary">Speichern</button>
                  </div>
                </div>
              )}

              {/* Default placeholder for other tabs */}
              {activeTab !== 'movies' && (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <FileEdit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-medium mb-2">Noch keine Inhalte</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Dies ist ein Platzhalter für {activeTab === 'shows' ? 'Serien' : 
                      activeTab === 'free' ? 'kostenlose Filme' : 
                      activeTab === 'trailers' ? 'neue Trailer' : 'Tags'}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium mb-6">Globale Einstellungen</h2>
            
            <div className="max-w-xl">
              <div className="mb-6">
                <Label htmlFor="amazonId">Amazon Affiliate ID</Label>
                <div className="flex mt-1">
                  <Input 
                    id="amazonId" 
                    value={amazonAffiliateId} 
                    onChange={(e) => setAmazonAffiliateId(e.target.value)}
                    placeholder="movieflair-21" 
                    className="flex-grow" 
                  />
                  <button onClick={saveSettings} className="button-primary ml-2">
                    Speichern
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Diese ID wird für alle Amazon Affiliate Links verwendet.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
