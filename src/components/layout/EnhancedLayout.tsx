
import { ReactNode } from 'react';
import MainLayout from './MainLayout';
import SearchRedirect from '../search/SearchRedirect';

interface EnhancedLayoutProps {
  children: ReactNode;
}

/**
 * This component enhances the original MainLayout with search functionality
 * without modifying the original component.
 */
const EnhancedLayout = ({ children }: EnhancedLayoutProps) => {
  return (
    <MainLayout>
      <SearchRedirect />
      {children}
    </MainLayout>
  );
};

export default EnhancedLayout;
