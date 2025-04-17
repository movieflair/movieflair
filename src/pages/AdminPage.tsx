
import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';

const AdminPage = () => {
  const { user } = useAuth();
  
  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin-Bereich</h1>
          <p className="text-gray-600">
            Der Admin-Bereich wurde zurückgesetzt und wird neu implementiert.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
