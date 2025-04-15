import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface EnhancedLayoutProps {
  children: ReactNode;
}

const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedLayout;
