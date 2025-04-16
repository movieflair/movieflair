
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // SSR-Konfiguration
  build: {
    // Client build output
    outDir: mode === 'production' ? 'dist/client' : 'dist',
    
    // SSR specific build configuration
    ssr: mode === 'ssr' ? './src/App.tsx' : undefined,
    
    // Generate SSR manifest in production
    ssrManifest: mode === 'production',
  },
}));
