
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AdminPanel from '@/components/admin/AdminPanel';
import { AdminSettingsProvider } from '@/hooks/useAdminSettings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const queryClient = new QueryClient();

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set admin flag in localStorage to prevent tracking
    localStorage.setItem('isAdminLoggedIn', 'true');
    
    if (!authLoading) {
      checkAdminAccess();
    }

    // Ensure the storage bucket exists
    const initStorage = async () => {
      try {
        // Check if bucket exists and create it if it doesn't
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error('Error listing storage buckets:', listError);
          return;
        }
        
        const movieImagesBucket = buckets?.find(bucket => bucket.name === 'movie_images');
        
        if (!movieImagesBucket) {
          console.log('Creating movie_images bucket...');
          // Call our bucket creation edge function
          const { error: createError } = await supabase.functions.invoke('create-storage-bucket', {
            body: { name: 'movie_images' }
          });
          
          if (createError) {
            console.error('Error creating movie_images bucket:', createError);
            toast.error('Fehler beim Erstellen des Speicher-Buckets');
          } else {
            console.log('movie_images bucket created successfully');
          }
        } else {
          console.log('movie_images bucket already exists');
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };

    if (user && isLoggedIn) {
      initStorage();
    }

    // Clean up function to remove the flag when leaving the admin area
    return () => {
      localStorage.removeItem('isAdminLoggedIn');
    };
  }, [user, authLoading, isLoggedIn]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsLoading(false);
      setIsLoggedIn(false);
      toast.error("Bitte melde dich an, um fortzufahren");
      navigate('/auth');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Unexpected error checking admin status:', error);
      setIsLoading(false);
      setIsLoggedIn(false);
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
      navigate('/');
    }
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
