
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteAllMovies, cleanAllCustomLists } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieCmsModule from '@/components/admin/MovieCmsModule';
import { DatabaseZap, FilmIcon, Settings, ServerIcon } from 'lucide-react';
import { setupStorage } from '@/lib/setupStorage';

const AdminPage = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingUpStorage, setIsSettingUpStorage] = useState(false);
  
  // Initialize storage bucket when admin page loads
  useEffect(() => {
    if (user) {
      initializeStorage();
    }
  }, [user]);
  
  // Initialize storage bucket
  const initializeStorage = async () => {
    try {
      await setupStorage();
    } catch (error) {
      console.error('Error initializing storage bucket:', error);
    }
  };
  
  // Manually set up storage bucket
  const handleSetupStorage = async () => {
    setIsSettingUpStorage(true);
    toast.loading('Setting up storage bucket...');
    
    try {
      await setupStorage();
      toast.dismiss();
      toast.success('Storage bucket successfully set up');
    } catch (error) {
      console.error('Error setting up storage bucket:', error);
      toast.dismiss();
      toast.error('Error setting up storage bucket');
    } finally {
      setIsSettingUpStorage(false);
    }
  };
  
  // Redirect to login page if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDeleteAllContent = async () => {
    if (!confirm('Bist du sicher, dass du ALLE Inhalte löschen willst? Dies umfasst alle Filme, TV-Shows und Filme in Listen. Diese Aktion kann nicht rückgängig gemacht werden!')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      toast.loading('Lösche alle Inhalte aus der Datenbank...');
      
      // Zuerst alle benutzerdefinierten Listen leeren (Filme aus Listen entfernen)
      const listsCleanResult = await cleanAllCustomLists();
      if (!listsCleanResult) {
        toast.error('Fehler beim Leeren der Filmlisten');
        return;
      }
      
      // Dann alle Filme und TV-Shows löschen
      const deleteResult = await deleteAllMovies();
      if (!deleteResult) {
        toast.error('Fehler beim Löschen der Filme und TV-Shows');
        return;
      }
      
      toast.dismiss();
      toast.success('Alle Inhalte wurden erfolgreich gelöscht');
    } catch (error) {
      console.error('Fehler beim Zurücksetzen der Datenbank:', error);
      toast.error('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin-Bereich</h1>
          
          <Tabs defaultValue="movies" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="movies" className="gap-2">
                <FilmIcon size={16} /> Film Management
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Settings size={16} /> System
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="movies">
              <MovieCmsModule />
            </TabsContent>
            
            <TabsContent value="system">
              {/* Storage Management */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ServerIcon size={20} /> Speicher-Verwaltung
                </h2>
                <p className="text-gray-600 mb-4">
                  Hier kannst du den Speicher-Bucket für Filmbilder einrichten oder reparieren.
                  Diese Funktion wird automatisch aufgerufen, wenn du die Admin-Seite öffnest,
                  kann aber bei Problemen auch manuell gestartet werden.
                </p>
                
                <Button 
                  variant="outline" 
                  onClick={handleSetupStorage} 
                  disabled={isSettingUpStorage}
                  className="mt-2"
                >
                  {isSettingUpStorage ? 'Wird eingerichtet...' : 'Speicher-Bucket einrichten/reparieren'}
                </Button>
              </div>
              
              {/* Database Management */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DatabaseZap size={20} /> Datenbank-Verwaltung
                </h2>
                <p className="text-gray-600 mb-4">
                  Hier kannst du die gesamte Filmdatenbank zurücksetzen. Dies löscht alle Filme, TV-Shows 
                  und entfernt alle Filme aus den Filmlisten. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAllContent} 
                  disabled={isDeleting}
                  className="mt-2"
                >
                  {isDeleting ? 'Wird gelöscht...' : 'Alle Inhalte löschen'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
