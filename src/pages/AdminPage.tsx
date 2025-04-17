
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminPage = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDeleteAllMovies = async () => {
    if (!confirm('Bist du sicher, dass du ALLE Filme aus der Datenbank löschen willst? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      toast.loading('Lösche alle Filme aus der Datenbank...');
      
      // Delete all movies from admin_movies table
      const { error: moviesError } = await supabase
        .from('admin_movies')
        .delete()
        .neq('id', 0); // Delete all entries
      
      if (moviesError) {
        console.error('Fehler beim Löschen der Filme:', moviesError);
        toast.error('Fehler beim Löschen der Filme');
        return;
      }
      
      // Delete all TV shows from admin_shows table
      const { error: showsError } = await supabase
        .from('admin_shows')
        .delete()
        .neq('id', 0); // Delete all entries
      
      if (showsError) {
        console.error('Fehler beim Löschen der TV-Shows:', showsError);
        toast.error('Fehler beim Löschen der TV-Shows');
        return;
      }
      
      toast.dismiss();
      toast.success('Alle Filme und TV-Shows wurden erfolgreich gelöscht');
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin-Bereich</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Datenbank-Verwaltung</h2>
            <p className="text-gray-600 mb-4">
              Hier kannst du die Filmdatenbank zurücksetzen und alle Einträge löschen.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllMovies} 
              disabled={isDeleting}
              className="mt-2"
            >
              {isDeleting ? 'Wird gelöscht...' : 'Datenbank zurücksetzen'}
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <p className="text-gray-600">
              Der Admin-Bereich wird gerade neu aufgebaut. Weitere Funktionen werden in Kürze implementiert.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
