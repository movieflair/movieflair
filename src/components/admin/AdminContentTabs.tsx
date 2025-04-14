
import { useState } from 'react';
import { List, Play, PlayCircle, Gift, Tag, Video, Tv, Film } from 'lucide-react';

interface AdminContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentView: 'all' | 'free' | 'trailers';
  handleViewChange: (view: 'all' | 'free' | 'trailers') => void;
}

const AdminContentTabs = ({ 
  activeTab, 
  setActiveTab, 
  currentView, 
  handleViewChange 
}: AdminContentTabsProps) => {
  return (
    <div className="flex border-b border-border overflow-x-auto">
      <button
        className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
          activeTab === 'movies'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => {
          setActiveTab('movies');
          handleViewChange('all');
        }}
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
        onClick={() => {
          setActiveTab('shows');
        }}
      >
        <Tv className="w-4 h-4 mr-2" />
        Serien
      </button>
      <button
        className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
          activeTab === 'movies' && currentView === 'free'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => {
          setActiveTab('movies');
          handleViewChange('free');
        }}
      >
        <Video className="w-4 h-4 mr-2" />
        Kostenlose Filme
      </button>
      <button
        className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
          activeTab === 'movies' && currentView === 'trailers'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => {
          setActiveTab('movies');
          handleViewChange('trailers');
        }}
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
  );
};

export default AdminContentTabs;
