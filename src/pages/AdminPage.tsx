
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if admin is already logged in
    const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
  }, []);
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  return (
    <MainLayout>
      <div className="py-12">
        {isLoggedIn ? (
          <AdminPanel />
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
