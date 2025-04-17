
import express from 'express';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import sitemapRouter from './src/routes/sitemap';
import { setupViteMiddleware } from './src/middleware/vite';
import { renderApp } from './src/utils/renderUtils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  let vite;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }
  
  // Setup Vite middleware
  await setupViteMiddleware(app, vite, isProduction);
  
  // Mount the sitemap router
  app.use('/', sitemapRouter);

  // Main rendering middleware
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const isCrawler = req.get('User-Agent')?.toLowerCase().includes('bot') ||
                       req.get('User-Agent')?.toLowerCase().includes('crawler') ||
                       req.query.forceSSR === 'true';
      
      const isImportantRoute = 
        url.match(/^\/film\/\d+/) || 
        url.match(/^\/serie\/\d+/) || 
        url.match(/^\/liste\//) ||
        ['/', '/neue-trailer', '/kostenlose-filme', '/entdecken', '/filmlisten'].includes(url);

      if ((!isCrawler && !isImportantRoute) && !req.query.forceSSR) {
        const indexHtml = fs.readFileSync(
          path.resolve(__dirname, isProduction ? 'dist/client/index.html' : 'index.html'),
          'utf-8'
        );
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
      }

      // Load and transform template
      let template;
      let App;
      
      if (!isProduction) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const { default: entryServer } = await vite.ssrLoadModule('/src/App.tsx');
        App = entryServer;
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        const { default: entryServer } = await import('./dist/server/App.js');
        App = entryServer;
      }

      const helmetContext = {};
      await renderApp(url, template, App, helmetContext, res);
    } catch (error) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(error);
      }
      console.error('Server error:', error);
      next(error);
    }
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
