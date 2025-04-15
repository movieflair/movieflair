
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SearchRedirect from '../search/SearchRedirect';

interface EnhancedLayoutProps {
  children: ReactNode;
}

const EnhancedLayout = ({ children }: EnhancedLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <SearchRedirect />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedLayout;
