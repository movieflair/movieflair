
import express from 'express';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { setupViteMiddleware } from './src/middleware/vite';
import routes from './src/routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  
  console.log(`[Server] Starting in ${isProduction ? 'production' : 'development'} mode`);

  let vite = null;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }
  
  // Setup Vite middleware
  await setupViteMiddleware(app, vite, isProduction);
  
  // Add vite to request object for use in routes
  app.use((req, res, next) => {
    req.vite = vite;
    console.log(`[Server] Processing request for: ${req.originalUrl}`);
    next();
  });

  // Mount all routes
  app.use(routes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('[Server] Server error:', err);
    res.status(500).send('Internal Server Error');
  });

  app.listen(PORT, () => {
    console.log(`[Server] Server running on http://localhost:${PORT}`);
    console.log(`[Server] Mode: ${isProduction ? 'Production' : 'Development'}`);
  });
}

startServer();
