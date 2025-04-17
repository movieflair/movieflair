
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { AdminSettingsProvider } from './hooks/useAdminSettings'

// Create a client
const queryClient = new QueryClient()

// Client-Side Rendering - wird nicht für SSR verwendet, sondern nur beim Hydration
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AdminSettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AdminSettingsProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
