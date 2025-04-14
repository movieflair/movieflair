
import { useState } from 'react';
import { Search, FileEdit, Film, Tv, Tag } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');

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

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'movies'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('movies')}
          >
            <Film className="w-4 h-4 mr-2" />
            Movies
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'shows'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('shows')}
          >
            <Tv className="w-4 h-4 mr-2" />
            TV Shows
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'tags'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('tags')}
          >
            <Tag className="w-4 h-4 mr-2" />
            Custom Tags
          </button>
        </div>

        <div className="p-4">
          <div className="flex max-w-md mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button className="button-primary ml-2">
              Search
            </button>
          </div>

          {/* Placeholder content for the admin panel */}
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <FileEdit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No Content Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              This is a placeholder for the admin panel content. In a real application, 
              this would display content from your database that you can edit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
