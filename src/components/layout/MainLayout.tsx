
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Check if admin is logged in from localStorage
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={isAdminLoggedIn} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
