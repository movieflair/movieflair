
import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminSettings {
  amazonAffiliateId: string;
  logoUrl: string; // Add the missing logoUrl property
}

const defaultSettings: AdminSettings = {
  amazonAffiliateId: 'movieflair-21',
  logoUrl: '/movieflair-logo.svg', // Set a default value
};

const AdminSettingsContext = createContext<AdminSettings>(defaultSettings);

export const useAdminSettings = () => useContext(AdminSettingsContext);

interface AdminSettingsProviderProps {
  children: ReactNode;
}

export const AdminSettingsProvider = ({ children }: AdminSettingsProviderProps) => {
  const [settings] = useState<AdminSettings>(defaultSettings);
  
  return (
    <AdminSettingsContext.Provider value={settings}>
      {children}
    </AdminSettingsContext.Provider>
  );
};
