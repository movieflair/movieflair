
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AdminSettings {
  amazonAffiliateId: string;
}

interface AdminSettingsContextType {
  amazonAffiliateId: string;
  setAmazonAffiliateId: (id: string) => void;
  saveSettings: () => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export const AdminSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [amazonAffiliateId, setAmazonAffiliateId] = useState('');

  useEffect(() => {
    // Load settings from localStorage on component mount
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as AdminSettings;
        setAmazonAffiliateId(parsedSettings.amazonAffiliateId || '');
      }
    };

    loadSettings();
  }, []);

  const saveSettings = () => {
    const settings: AdminSettings = {
      amazonAffiliateId
    };
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    // You could add a toast notification here
  };

  return (
    <AdminSettingsContext.Provider value={{
      amazonAffiliateId,
      setAmazonAffiliateId,
      saveSettings
    }}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = () => {
  const context = useContext(AdminSettingsContext);
  if (context === undefined) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
};
