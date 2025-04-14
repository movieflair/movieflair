
import { ReactNode } from 'react';
import MainLayout from './MainLayout';

interface EnhancedLayoutProps {
  children: ReactNode;
}

/**
 * This component enhances the original MainLayout
 * without modifying the original component.
 */
const EnhancedLayout = ({ children }: EnhancedLayoutProps) => {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

export default EnhancedLayout;
