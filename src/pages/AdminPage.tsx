
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AdminPanel from '@/components/admin/AdminPanel';
import { trackPageVisit } from '@/lib/api';
import { AdminSettingsProvider } from '@/hooks/useAdminSettings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ensureStorageBucketExists } from '@/lib/setupStorage';

const queryClient = new QueryClient();

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set admin flag in localStorage to prevent tracking
    localStorage.setItem('isAdminLoggedIn', 'true');
    
    if (!authLoading) {
      checkAdminAccess();
    }

    // Create the storage bucket for movie images if needed
    const initStorage = async () => {
      if (storageInitialized) return;
      
      try {
        await ensureStorageBucketExists();
        setStorageInitialized(true);
      } catch (error) {
        console.error('Error initializing storage:', error);
        toast.error('Fehler bei der Initialisierung des Speicherbuckets');
      }
    };

    if (user && !storageInitialized) {
      initStorage();
    }

    // Clean up function to remove the flag when leaving the admin area
    return () => {
      localStorage.removeItem('isAdminLoggedIn');
    };
  }, [user, storageInitialized, authLoading]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsLoading(false);
      setIsLoggedIn(false);
      toast.error("Bitte melde dich an, um fortzufahren");
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase.rpc(
      'has_role',
      { 
        _user_id: user.id,
        _role: 'admin'
      }
    );

    if (error) {
      console.error('Error checking admin role:', error);
      setIsLoading(false);
      setIsLoggedIn(false);
      toast.error("Fehler beim Überprüfen der Berechtigungen");
      navigate('/');
      return;
    }

    if (!data) {
      setIsLoading(false);
      setIsLoggedIn(false);
      toast.error("Keine Administrator-Rechte");
      navigate('/');
      return;
    }

    setIsLoggedIn(true);
    setIsLoading(false);
  };

  if (isLoading || authLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="py-12">
        {isLoggedIn ? (
          <QueryClientProvider client={queryClient}>
            <AdminSettingsProvider>
              <AdminPanel />
            </AdminSettingsProvider>
          </QueryClientProvider>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
