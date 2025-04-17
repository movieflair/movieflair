
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { setupStorage } from './lib/setupStorage'
import { AdminSettingsProvider } from './hooks/useAdminSettings'

// Initialisiere den Storage-Bucket
setupStorage().catch(console.error);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 Minuten
      refetchOnWindowFocus: false
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AdminSettingsProvider>
            <App />
            <Toaster position="top-center" richColors />
          </AdminSettingsProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
