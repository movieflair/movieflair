
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';
import { trackPageVisit } from '@/lib/api';
import { AdminSettingsProvider } from '@/hooks/useAdminSettings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new query client instance
const queryClient = new QueryClient();

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Seiten-Aufruf tracken
    trackPageVisit('admin');
    
    // Check if admin is already logged in
    const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
  }, []);
  
  const handleLogin = () => {
    // Set admin login status in localStorage
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsLoggedIn(true);
  };
  
  return (
    <MainLayout>
      <div className="py-12">
        {isLoggedIn ? (
          <QueryClientProvider client={queryClient}>
            <AdminSettingsProvider>
              <AdminPanel />
            </AdminSettingsProvider>
          </QueryClientProvider>
        ) : (
          <div className="container-custom max-w-md">
            <AdminLogin onLogin={handleLogin} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
