
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

  let vite = null;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }
  
  // Add a special middleware to always force server rendering for specific routes
  app.use((req, res, next) => {
    if (req.url === '/neue-trailer' || req.url === '/' || req.url === '/kostenlose-filme') {
      console.log(`🚨 EMERGENCY OVERRIDE: Forcing SSR for ${req.url} route`);
      req.query.forceSSR = 'true';
      req.query.forceUpdate = 'true';
    }
    next();
  });
  
  // Setup Vite middleware
  await setupViteMiddleware(app, vite, isProduction);
  
  // Add vite to request object for use in routes
  app.use((req, res, next) => {
    req.vite = vite;
    console.log(`Processing request for: ${req.url}`);
    next();
  });

  // Mount all routes
  app.use(routes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${isProduction ? 'Production' : 'Development'}`);
    if (isProduction) {
      console.log('=======================================');
      console.log('PUBLIC DEPLOYMENT MODE ACTIVE');
      console.log('Version: 2.0.9 - EMERGENCY PRODUCTION DEPLOYMENT');
      console.log('=======================================');
    }
  });
}

startServer();
