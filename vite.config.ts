
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
    // Commonjs für den Server
    outDir: mode === 'production' ? 'dist/client' : 'dist',
    // Separate SSR-Build-Konfiguration
    ssr: mode === 'ssr' ? './src/App.tsx' : undefined,
    ssrManifest: mode === 'production',
  },
}));
