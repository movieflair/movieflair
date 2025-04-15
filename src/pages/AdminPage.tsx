
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';
import { trackPageVisit } from '@/lib/api';
import { AdminSettingsProvider } from '@/hooks/useAdminSettings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const queryClient = new QueryClient();

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    trackPageVisit('admin');
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setIsLoading(false);
      setIsLoggedIn(false);
      toast.error("Bitte melde dich an, um fortzufahren");
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase.rpc(
      'has_role',
      { 
        _user_id: session.user.id,
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

  if (isLoading) {
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
